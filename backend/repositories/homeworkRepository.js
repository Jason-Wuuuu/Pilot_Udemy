import { ddb } from "../db/dynamodb.js";
import {
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const HOMEWORK_TABLE = process.env.HOMEWORK_TABLE || "Homeworks";

export const findAll = async () => {
  const result = await ddb.send(
    new ScanCommand({
      TableName: HOMEWORK_TABLE,
    })
  );
  return result.Items || [];
};

export const findById = async (id) => {
  const result = await ddb.send(
    new GetCommand({
      TableName: HOMEWORK_TABLE,
      Key: { id },
    })
  );
  return result.Item || null;
};

export const create = async (homeworkData) => {
  const now = new Date().toISOString();
  const newHomework = {
    id: `hw_${uuidv4()}`,
    ...homeworkData,
    submissions: [],
    createdAt: now,
    updatedAt: now,
  };

  await ddb.send(
    new PutCommand({
      TableName: HOMEWORK_TABLE,
      Item: newHomework,
    })
  );

  return newHomework;
};

export const update = async (id, updatedData) => {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  // Always update updatedAt
  updatedData.updatedAt = new Date().toISOString();

  Object.keys(updatedData).forEach((key) => {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = updatedData[key];
  });

  const result = await ddb.send(
    new UpdateCommand({
      TableName: HOMEWORK_TABLE,
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
      TableName: HOMEWORK_TABLE,
      Key: { id },
    })
  );
};
