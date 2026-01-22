import {
  QueryCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import crypto from "crypto";
import { ddb } from "../config/dynamodb.js";
import { buildCoursePK } from "../models/course.model.js";
import { buildLectureItem, buildLectureSK } from "../models/lecture.model.js";

const TABLE_NAME = process.env.DYNANODB_COURSE_TABLE_NAME || "Courses";
export const getNextLectureOrder = async (courseId) => {
  const result = await ddb.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: `COURSE#${courseId}`,
        SK: "META#LECTURE_COUNTER",
      }),
      UpdateExpression:
        "SET nextLectureOrder = if_not_exists(nextLectureOrder, :start) + :inc",
      ExpressionAttributeValues: marshall({
        ":start": 0,
        ":inc": 1,
      }),
      ReturnValues: "UPDATED_NEW",
    }),
  );

  return Number(result.Attributes.nextLectureOrder.N);
};
export const getLecturesByCourseId = async (courseId) => {
  const { Items = [] } = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      FilterExpression: "#et = :lecture",
      ExpressionAttributeNames: {
        "#et": "entityType",
      },
      ExpressionAttributeValues: marshall({
        ":pk": buildCoursePK(courseId),
        ":sk": "LECTURE#",
        ":lecture": "LECTURE",
      }),
    })
  );

  return Items.map(unmarshall);
};


export const createLecture = async ({ courseId, title, description }) => {
  const lectureOrder = await getNextLectureOrder(courseId);
  const lectureId = crypto.randomUUID();

  const item = buildLectureItem({
    courseId,
    lectureId,
    lectureOrder,
    title,
    description,
  });


  await ddb.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item,{ removeUndefinedValues: true }),
      ConditionExpression:
        "attribute_not_exists(PK) AND attribute_not_exists(SK)",
    }),
  );

  return item;
};

export const updateLecture = async (courseId, lectureId, updates) => {
  const lectures = await getLecturesByCourseId(courseId);

  const lecture = lectures.find(
    (l) => l.lectureId === lectureId
  );

  if (!lecture) {
    throw new Error("Lecture not found");
  }
  
  const FORBIDDEN_FIELDS = new Set([
    "PK",
    "SK",
    "lectureId",
    "lectureOrder",
    "createdAt",
  ]);

  const expressions = [];
  const values = {};
  const names = {};

  for (const [k, v] of Object.entries(updates)) {
    if (FORBIDDEN_FIELDS.has(k)) continue;

    expressions.push(`#${k} = :${k}`);
    names[`#${k}`] = k;
    values[`:${k}`] = v;
  }

  expressions.push("#updatedAt = :updatedAt");
  names["#updatedAt"] = "updatedAt";
  values[":updatedAt"] = new Date().toISOString();

  const { Attributes } = await ddb.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: lecture.PK,
        SK: lecture.SK, // ✅ LECTURE#0003
      }),
      UpdateExpression: `SET ${expressions.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: marshall(values, {
        removeUndefinedValues: true,
      }),
      ConditionExpression:
        "attribute_exists(PK) AND attribute_exists(SK)",
      ReturnValues: "ALL_NEW",
    })
  );

  return unmarshall(Attributes);
};

export const deleteLecture = async (courseId, lectureId) => {
  const lectures = await getLecturesByCourseId(courseId);

  const lecture = lectures.find(
    (l) => l.lectureId === lectureId
  );
  
  if (!lecture) {
    throw new Error("Lecture not found");
  }
   await ddb.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        PK: lecture.PK,
        SK: lecture.SK,
      }),
      ConditionExpression:
        "attribute_exists(PK) AND attribute_exists(SK)",
    })
  );

  return {
    deleted: true,
    lectureId,
  };
};
