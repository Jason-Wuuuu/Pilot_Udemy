// import dotenv from "dotenv";

// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
// import { fromTemporaryCredentials } from "@aws-sdk/credential-providers";

// dotenv.config();

// const client = new DynamoDBClient({
//   region: process.env.AWS_REGION,
//   credentials: fromTemporaryCredentials({
//     params: {
//       RoleArn: process.env.AWS_ROLE_ARN,
//       RoleSessionName: "homework",
//     },
//   }),
// });

// export const ddb = DynamoDBDocumentClient.from(client);

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import dotenv from "dotenv";
dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

export const ddb = DynamoDBDocumentClient.from(client);
