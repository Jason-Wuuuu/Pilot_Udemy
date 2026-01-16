import dotenv from "dotenv";
dotenv.config();

import {
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/dynamoClient.js";

import {
  buildCourseItem,
  buildCoursePK,
  COURSE_METADATA_SK,
} from "../models/course.model.js";

import { buildCategoryPK } from "../models/category.model.js";

import {
  buildLectureItem,
  buildLectureSK,
  buildMaterialItem,
  buildMaterialSK,
} from "../models/lecture.model.js";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

export const getCourseById = async (courseId) => {
  const { Item } = await client.send(
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
  const { Items = [] } = await client.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: marshall({
        ":pk": buildCategoryPK(categoryId),
      }),
    })
  );

  return Items.map(unmarshall);
};

export const createCourseItem = async (payload) => {
  const item = buildCourseItem(payload);

  await client.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item),
      ConditionExpression:
        "attribute_not_exists(PK) AND attribute_not_exists(SK)",
    })
  );

  return item;
};

export const updateCourseItem = async (courseId, updates) => {
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error("No update fields provided");
  }
  const expressions = [];
  const values = {};
  const names = {};

  Object.entries(updates).forEach(([key, value]) => {
    const attrName = `#${key}`;
    const attrValue = `:${key}`;

    expressions.push(`${attrName} = ${attrValue}`);
    names[attrName] = key;
    values[attrValue] = value;
  });

  const { Attributes } = await client.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: COURSE_METADATA_SK,
      }),
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: marshall(values),
      ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
      ReturnValues: "ALL_NEW",
    })
  );

  return unmarshall(Attributes);
};

export const deleteCourseItem = async (courseId) => {
  await client.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: COURSE_METADATA_SK,
      }),
      ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
    })
  );
};

/* =========================
   LECTURES
========================= */

export const getLecturesByCourseId = async (courseId) => {
  const { Items = [] } = await client.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: marshall({
        ":pk": buildCoursePK(courseId),
        ":sk": "LECTURE#",
      }),
    })
  );

  return Items.map(unmarshall);
};

export const createLectureItem = async (payload) => {
  const item = buildLectureItem(payload);

  await client.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item),
      ConditionExpression:
        "attribute_not_exists(PK) AND attribute_not_exists(SK)",
    })
  );

  return item;
};

export const updateLectureItem = async (courseId, lectureId, updates) => {
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error("No update fields provided");
  }
  const expressions = [];
  const values = {};

  Object.entries(updates).forEach(([key, value]) => {
    expressions.push(`${key} = :${key}`);
    values[`:${key}`] = value;
  });

  const { Attributes } = await client.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: buildLectureSK(lectureId),
      }),
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ExpressionAttributeValues: marshall(values),
      ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
      ReturnValues: "ALL_NEW",
    })
  );

  return unmarshall(Attributes);
};

export const deleteLectureItem = async (courseId, lectureId) => {
  await client.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: buildLectureSK(lectureId),
      }),
      ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
    })
  );
};

/* =========================
   MATERIALS
========================= */

export const getMaterialsByLectureOrder = async (courseId, lectureOrder) => {

  const { Items = [] } = await client.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: marshall({
        ":pk": buildCoursePK(courseId),
        ":sk": `${buildLectureSK(lectureOrder)}#MATERIAL#`,
      }),
    })
  );

  return Items.map(unmarshall);
};

export const getMaterialTypeFromMime = (mimeType) => {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("video/")) return "VIDEO";
  throw new Error("Unsupported file type");
};

export const createMaterialItem = async (payload) => {
  const item = buildMaterialItem(payload);

  await client.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item, { removeUndefinedValues: true }),
      ConditionExpression:
        "attribute_not_exists(PK) AND attribute_not_exists(SK)",
    })
  );

  return item;
};

export const updateMaterialItem = async ({
  courseId,
  lectureOrder,
  materialOrder,
  updates,
}) => {
  if (!courseId || lectureOrder === undefined || materialOrder === undefined) {
    throw new Error("Missing required key fields");
  }

  if (!updates || Object.keys(updates).length === 0) {
    throw new Error("No update fields provided");
  }

  const updateExpressions = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  Object.entries(updates).forEach(([key, value]) => {
    const attrName = `#${key}`;
    const attrValue = `:${key}`;

    updateExpressions.push(`${attrName} = ${attrValue}`);
    expressionAttributeNames[attrName] = key;
    expressionAttributeValues[attrValue] = value;
  });

  const { Attributes } = await client.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: buildMaterialSK(lectureOrder, materialOrder),
      }),
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
      ReturnValues: "ALL_NEW",
    })
  );

  return unmarshall(Attributes);
};


export const deleteMaterialItem = async (
  courseId,
  lectureOrder,
  materialOrder
) => {
  await client.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: buildMaterialSK(lectureOrder, materialOrder),
      }),
      ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
    })
  );

  return { deleted: true };
};

export const deleteCourseCascade = async (courseId) => {
  const { Items = [] } = await client.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: marshall({
        ":pk": buildCoursePK(courseId),
      }),
    })
  );

  if (Items.length === 0) {
    throw Object.assign(new Error("Course not found"), {
      statusCode: 404,
    });
  }

  const deleteRequests = Items.map((item) => ({
    Delete: {
      TableName: TABLE_NAME,
      Key: {
        PK: item.PK,
        SK: item.SK,
      },
      ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
    },
  }));

  const CHUNK_SIZE = 25;

  for (let i = 0; i < deleteRequests.length; i += CHUNK_SIZE) {
    const chunk = deleteRequests.slice(i, i + CHUNK_SIZE);

    await client.send(
      new TransactWriteItemsCommand({
        TransactItems: chunk,
      })
    );
  }

  return { deleted: true };
};
