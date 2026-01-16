import { ddb } from "../db/dynamodb.js";
import {
  PutCommand,
  ScanCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const SUBMISSION_TABLE = process.env.SUBMISSION_TABLE || "HomeworkSubmissions";

export const findAll = async () => {
  const result = await ddb.send(
    new ScanCommand({
      TableName: SUBMISSION_TABLE,
    })
  );
  return result.Items || [];
};

export const findById = async (id) => {
  const result = await ddb.send(
    new GetCommand({
      TableName: SUBMISSION_TABLE,
      Key: { id },
    })
  );
  return result.Item || null;
};

export const findByHomeworkId = async (homeworkId) => {
  const result = await ddb.send(
    new ScanCommand({
      TableName: SUBMISSION_TABLE,
      FilterExpression: "homeworkId = :homeworkId",
      ExpressionAttributeValues: {
        ":homeworkId": homeworkId,
      },
    })
  );
  return result.Items || [];
};

export const create = async (submissionData) => {
  const newSubmission = {
    id: `sub_${uuidv4()}`,
    ...submissionData,
    score: null,
    feedback: null,
    submittedAt: new Date().toISOString(),
  };

  await ddb.send(
    new PutCommand({
      TableName: SUBMISSION_TABLE,
      Item: newSubmission,
    })
  );

  return newSubmission;
};

export const update = async (id, updatedData) => {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updatedData).forEach((key) => {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = updatedData[key];
  });

  const result = await ddb.send(
    new UpdateCommand({
      TableName: SUBMISSION_TABLE,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes;
};

export const remove = async (id) => {
  await ddb.send(
    new DeleteCommand({
      TableName: SUBMISSION_TABLE,
      Key: { id },
    })
  );
};
