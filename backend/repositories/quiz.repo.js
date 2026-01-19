import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddb } from "../db/dynamodb.js";

const TABLE_NAME = "Quiz";
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
};

//5. get all quizzes
export const getQuizzesByUserIdRepo = async (userId) => {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: USER_INDEX,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
      ScanIndexForward: false, // 按 createdAt 倒序
    })
  );

  return res.Items || [];
};
