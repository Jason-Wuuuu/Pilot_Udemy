import {
  GetItemCommand,
  QueryCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {ddb} from "../config/dynamodb.js";
import crypto from "crypto";
import {
  buildCoursePK,
  COURSE_METADATA_SK,
} from "../models/course.model.js";
import { buildCategoryPK } from "../models/category.model.js";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;
if (!TABLE_NAME){
    throw new Error("DYNAMODB_TABLE_NAME is not configured");
}

export const getCourseById = async (courseId) => {
  const { Item } = await ddb.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: COURSE_METADATA_SK,
      }),
    })
  );
  return Item ? unmarshall(Item) : null;
};

export const getCoursesByCategoryId = async (categoryId) => {
  const { Items = [] } = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression:
        "GSI1PK = :pk",
      ExpressionAttributeValues: marshall({
        ":pk": buildCategoryPK(categoryId),
      }),
    })
  );

  return Items.map(unmarshall);
};

export const createCourse = async (payload) => {
  const {
    courseName,
    description,
    categoryName,
    level,
    createdBy,
    instructor,
    status = "DRAFT",
  } = payload;

  const courseId = crypto.randomUUID();
  const categoryId = String(categoryName).toLowerCase()
  const now = new Date().toISOString();

  const item = {
    PK: buildCoursePK(courseId),
    SK: COURSE_METADATA_SK,

    entityType: "COURSE",

    courseId,
    courseName,
    description,
    categoryId,
    categoryName,
    level,

    status,
    createdBy,
    instructor,

    studentIds: [],

    GSI1PK: buildCategoryPK(categoryId),
    GSI1SK: `COURSE#${courseId}`,

    createdAt: now,
    updatedAt: now,
  };
  

  await ddb.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item , { removeUndefinedValues: true }),
      ConditionExpression: "attribute_not_exists(PK)",
    })
  );

  return item;
};


export const updateCourse = async (courseId, updates) => {
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error("No update fields provided");
  }

  const FORBIDDEN_FIELDS = new Set([
    "PK",
    "SK",
    "courseId",
    "createdAt",
    "GSI1PK",
    "GSI1SK",
    "entityType",
  ]);

  const expressions = [];
  const values = {};
  const names = {};

  for (const [key, value] of Object.entries(updates)) {
    if (FORBIDDEN_FIELDS.has(key)) continue;

    expressions.push(`#${key} = :${key}`);
    names[`#${key}`] = key;
    values[`:${key}`] = value;
  }

  // always update timestamp
  expressions.push("#updatedAt = :updatedAt");
  names["#updatedAt"] = "updatedAt";
  values[":updatedAt"] = new Date().toISOString();

  const { Attributes } = await ddb.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: COURSE_METADATA_SK,
      }),
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: marshall(values),
      ReturnValues: "ALL_NEW",
      ConditionExpression: "attribute_exists(PK)",
    })
  );

  return unmarshall(Attributes);
};


export const deleteCourse = async (courseId) => {
  await ddb.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: COURSE_METADATA_SK,
      }),
      ConditionExpression: "attribute_exists(PK)",
    })
  );
};