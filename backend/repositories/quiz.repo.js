import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../db/dynamodb.js";

const TABLE_NAME = "Quiz";

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
