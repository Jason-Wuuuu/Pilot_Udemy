import {
  GetItemCommand,
  QueryCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  ScanCommand
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddb } from "../config/dynamodb.js";
import crypto from "crypto";
import { buildCoursePK, COURSE_METADATA_SK } from "../models/course.model.js";
import { buildCategoryPK } from "../models/category.model.js";

const TABLE_NAME = process.env.DYNANODB_COURSE_TABLE_NAME || "Courses";
if (!TABLE_NAME) {
  throw new Error("DYNAMODB_TABLE_NAME is not configured");
}


export const getAllCourses = async()=>{
  const {Items=[]} = await ddb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "#et = :course",
      ExpressionAttributeNames:{
        "#et":"entityType",
      },
      ExpressionAttributeValues: marshall({
        ":course":"COURSE",
      })

    })
  );
  return Items.map(unmarshall);
}


export const getCourseById = async (courseId) => {
  const { Item } = await ddb.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: COURSE_METADATA_SK,
      }),
    }),
  );
  return Item ? unmarshall(Item) : null;
};

export const getCoursesByCategoryId = async (categoryId) => {
  const { Items = [] } = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: marshall({
        ":pk": buildCategoryPK(categoryId),
      }),
    }),
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
  const categoryId = String(categoryName).toLowerCase();
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
      Item: marshall(item, { removeUndefinedValues: true }),
      ConditionExpression: "attribute_not_exists(PK)",
    }),
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
    }),
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
    }),
  );
};
export const registerStudents = async ({ courseId, studentIds }) => {
   // 1️⃣ Get current studentIds
  const { Item } = await ddb.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: `COURSE#${courseId}`,
        SK: "METADATA",
      }),
      ProjectionExpression: "studentIds",
    })
  );

  const currentStudentIds=
    Item ? unmarshall(Item).studentIds ?? [] : [];

  // 2️⃣ Diff
  const currentSet = new Set(currentStudentIds);

  const addedStudentIds = [];
  const alreadyRegisteredStudentIds= [];

  for (const id of studentIds) {
    if (currentSet.has(id)) {
      alreadyRegisteredStudentIds.push(id);
    } else {
      addedStudentIds.push(id);
    }
  }

  // 3️⃣ If nothing new → no DB write needed
  if (addedStudentIds.length === 0) {
    return {
      addedStudentIds: [],
      alreadyRegisteredStudentIds,
      finalStudentIds: currentStudentIds,
    };
  }

  const finalStudentIds = [...currentStudentIds, ...addedStudentIds];

  // 4️⃣ Update DynamoDB
  await ddb.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: `COURSE#${courseId}`,
        SK: "METADATA",
      }),
      UpdateExpression: "SET studentIds = :ids",
      ExpressionAttributeValues: marshall({
        ":ids": finalStudentIds,
      }),
    })
  );

  return {
    addedStudentIds,
    alreadyRegisteredStudentIds,
    finalStudentIds,
  };
};

export const deleteStudents = async ({ courseId, studentIds }) => {
  // 1️⃣ Fetch existing
  const { Item } = await ddb.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: `COURSE#${courseId}`,
        SK: "METADATA",
      }),
      ProjectionExpression: "studentIds",
    })
  );

  const current = Item ? unmarshall(Item).studentIds ?? [] : [];

  // 2️⃣ Remove requested students
  const toRemove = new Set(studentIds);
  const nextStudentIds = current.filter(
    (id) => !toRemove.has(id)
  );

  // 3️⃣ Update
  await ddb.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: `COURSE#${courseId}`,
        SK: "METADATA",
      }),
      UpdateExpression: "SET studentIds = :ids",
      ExpressionAttributeValues: marshall({
        ":ids": nextStudentIds,
      }),
    })
  );

  return nextStudentIds;
};
