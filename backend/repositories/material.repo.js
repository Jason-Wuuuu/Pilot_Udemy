import {
  QueryCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {ddb} from "../config/dynamodb.js";
import { buildCoursePK } from "../models/course.model.js";
import {
  buildMaterialItem,
  buildMaterialSK,
  buildLectureSK,
} from "../models/lecture.model.js";



const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;



export const getMaterialsByLectureOrder = async (courseId, lectureOrder) => {
  const { Items = [] } = await ddb.send(
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

const getNextMaterialOrder = async ({ courseId, lectureOrder }) => {
  const { Items = [] } = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: marshall({
        ":pk": buildCoursePK(courseId),
        ":sk": `${buildLectureSK(lectureOrder)}#MATERIAL#`,
      }),
      ProjectionExpression: "materialOrder",
    })
  );

  if (!Items.length) return 1;

  const orders = Items.map(i => unmarshall(i).materialOrder);
  return Math.max(...orders) + 1;
};


export const createMaterial = async ({
  courseId,
  lectureOrder,
  materialId,

  title,
  materialType,
  mimeType,
  size,

  storageType = "S3",
  s3Key,
}) => {
  // 1️⃣ Generate materialOrder atomically (repo owns ordering)
  const materialOrder = await getNextMaterialOrder({
    courseId,
    lectureOrder,
  });

  // 2️⃣ Build the item (repo owns the address)
  const item = buildMaterialItem({
    courseId,
    lectureOrder,
    materialOrder,
    materialId,

    title,
    materialType,
    mimeType,
    size,

    storageType,
    s3Key,
  });

  // 3️⃣ Persist safely (no silent overwrites, no ghosts)
  await ddb.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item, { removeUndefinedValues: true }),
      ConditionExpression:
        "attribute_not_exists(PK) AND attribute_not_exists(SK)",
    })
  );

  // 4️⃣ Return persisted item
  return item;
};


export const updateMaterial = async (courseId, lectureOrder, materialOrder, updates) => {
    if (!updates || Object.keys(updates).length === 0) {
    throw new Error("No update fields provided");
  }

  const FORBIDDEN_FIELDS = new Set([
    "PK",
    "SK",
    "courseId",
    "lectureOrder",
    "materialOrder",
    "materialId",
    "entityType",
    "createdAt",
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

  if (!expressions.length) {
    throw new Error("No valid fields to update");
  }

  expressions.push("#updatedAt = :updatedAt");
  names["#updatedAt"] = "updatedAt";
  values[":updatedAt"] = new Date().toISOString();

  const { Attributes } = await ddb.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: buildMaterialSK(lectureOrder, materialOrder),
      }),
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: marshall(values, {
        removeUndefinedValues: true,
      }),
      ConditionExpression: "attribute_exists(PK)",
      ReturnValues: "ALL_NEW",
    })
  );

  return unmarshall(Attributes);
};

export const deleteMaterial = async (
  courseId,
  lectureOrder,
  materialOrder
) => {
  await ddb.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: buildMaterialSK(lectureOrder, materialOrder),
      }),
      ConditionExpression: "attribute_exists(PK)",
    })
  );
};