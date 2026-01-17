// db/dynamodb.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
dotenv.config(); // loads variables from .env

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

export const ddbDocClient = DynamoDBDocumentClient.from(client);
