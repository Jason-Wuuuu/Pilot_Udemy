import {
  QueryCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {ddb} from "../config/dynamodb.js";
import { buildCoursePK } from "../models/course.model.js";
import { buildLectureItem, buildLectureSK } from "../models/lecture.model.js";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

export const getLecturesByCourseId = async (courseId) => {
  const { Items = [] } = await ddb.send(
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

export const createLecture = async (payload) => {
  const item = buildLectureItem(payload);
  await ddb.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item),
    })
  );
  return item;
};

export const updateLecture = async (courseId, lectureId, updates) => {
  const expressions = [];
  const values = {};

  for (const [k, v] of Object.entries(updates)) {
    expressions.push(`${k} = :${k}`);
    values[`:${k}`] = v;
  }

  const { Attributes } = await ddb.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: buildLectureSK(lectureId),
      }),
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ExpressionAttributeValues: marshall(values),
      ReturnValues: "ALL_NEW",
    })
  );

  return unmarshall(Attributes);
};

export const deleteLecture = async (courseId, lectureOrder) => {
  await ddb.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: buildCoursePK(courseId),
        SK: buildLectureSK(lectureOrder),
      }),
    })
  );
};

