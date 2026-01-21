import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddb } from "../config/dynamodb.js";

const TABLE_NAME = "Quiz";
const COURSE_TABLE = "Courses";
const USER_INDEX = "userId-createdAt-index";
//1. getquizbyid
export const getQuizByIdRepo = async (quizId) => {
  const res = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { quizId },
    })
  );
  return res.Item || null;
};

//2. create quiz
export const createQuizRepo = async (item) => {
  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );
  return item;
};

//3. update quiz
export const updateQuizByIdRepo = async (quizId, updates) => {
  const expNames = {};
  const expValues = {};
  const expSets = [];

  for (const [key, value] of Object.entries(updates)) {
    expNames[`#${key}`] = key;
    expValues[`:${key}`] = value;
    expSets.push(`#${key} = :${key}`);
  }

  if (expSets.length === 0) return null;

  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { quizId },
      UpdateExpression: `SET ${expSets.join(", ")}`,
      ExpressionAttributeNames: expNames,
      ExpressionAttributeValues: expValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return res.Attributes;
};

//4. delete quiz
export const deleteQuizByIdRepo = async (quizId) => {
  await ddb.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { quizId },
    })
  );
  return true;
};

//5. get all quizzes
export const getQuizzesByCourseIdRepo = async (courseId) => {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "courseId-createdAt-index",
      KeyConditionExpression: "courseId = :cid",
      ExpressionAttributeValues: {
        ":cid": courseId,
      },
      ScanIndexForward: false,
    })
  );

  return res.Items || [];
};

// 6️⃣ get all quizzes（ADMIN 用）
export const getAllQuizzesRepo = async () => {
  const res = await ddb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );

  return res.Items || [];
};

export const getCoursesByStudentIdRepo = async (studentId) => {
  const res = await ddb.send(
    new ScanCommand({
      TableName: COURSE_TABLE,
      FilterExpression: "entityType = :course AND contains(studentIds, :sid)",
      ExpressionAttributeValues: {
        ":course": "COURSE",
        ":sid": studentId,
      },
    })
  );

  return res.Items || [];
};

export const getAllCoursesRepo = async () => {
  const res = await ddb.send(
    new ScanCommand({
      TableName: COURSE_TABLE,
      FilterExpression: "entityType = :course",
      ExpressionAttributeValues: {
        ":course": "COURSE",
      },
    })
  );

  return res.Items || [];
};
