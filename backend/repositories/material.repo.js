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

export const createMaterial = async (payload) => {
  const item = buildMaterialItem(payload);
  await ddb.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item, { removeUndefinedValues: true }),
    })
  );
  return item;
};

export const updateMaterial = async (courseId, lectureOrder, materialOrder, updates) => {
  const expressions = [];
  const values = {};
  const names = {};

  for (const [k, v] of Object.entries(updates)) {
    expressions.push(`#${k} = :${k}`);
    names[`#${k}`] = k;
    values[`:${k}`] = v;
  }

  const { Attributes } = await ddb.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: buildMaterialSK(lectureOrder, materialOrder),
      }),
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: marshall(values),
      ReturnValues: "ALL_NEW",
    })
  );

  return unmarshall(Attributes);
};

export const deleteMaterial = async (courseId, lectureOrder, materialOrder) => {
  await ddb.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: buildMaterialSK(lectureOrder, materialOrder),
      }),
    })
  );
};
