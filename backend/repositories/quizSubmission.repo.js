import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../db/dynamodb.js";

const TABLE_NAME = "QuizSubmission";
const USER_INDEX = "userId-createdAt-index";

//1. Get ALL quiz submission history
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

//2. Submit Quiz
export const createSubmissionRepo = async (item) => {
  const res = await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );
  return res;
};
