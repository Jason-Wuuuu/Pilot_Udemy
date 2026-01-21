import { PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../config/dynamodb.js";

const TABLE_NAME = "QuizSubmission";
const USER_INDEX = "userId-createdAt-index";
const QUIZ_INDEX = "quizId-createdAt-index";

//1. Student Get ALL quiz submission history
export const getQuizSubmissionsByUserRepo = async (userId, limit = 20) => {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: USER_INDEX,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
      ScanIndexForward: false, // newest first
      Limit: limit,
    })
  );

  return res.Items || [];
};

//2. Admin Get All quiz submission History for one quiz

export const getSubmissionsByQuizRepo = async (quizId) => {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: QUIZ_INDEX,
      KeyConditionExpression: "quizId = :qid",
      ExpressionAttributeValues: {
        ":qid": quizId,
      },
      ScanIndexForward: false,
    })
  );

  return res.Items || [];
};

//3. Get Single Submission Detail
export const getSubmissionByIdRepo = async (submissionId) => {
  const res = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { submissionId },
    })
  );

  return res.Item || null;
};

//3. Submit Quiz
export const createSubmissionRepo = async (item) => {
  const res = await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );
  return res;
};

//4. 一个quiz只能交一次
export const getSubmissionByUserAndQuizRepo = async (userId, quizId) => {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: USER_INDEX,
      KeyConditionExpression: "userId = :uid",
      FilterExpression: "quizId = :qid",
      ExpressionAttributeValues: {
        ":uid": userId,
        ":qid": quizId,
      },
      Limit: 1,
    })
  );

  return res.Items?.[0] || null;
};
