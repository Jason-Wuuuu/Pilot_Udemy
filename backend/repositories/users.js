// db/users.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ddb } from "../config/dynamodb.js";
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "Users";
const EMAIL_INDEX = "email-index"; // Make sure your GSI exists in DynamoDB

/**
 * Find a user by email using a GSI
 * @param {string} email
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function findUserByEmail(email) {
  const params = {
    TableName: TABLE_NAME,
    IndexName: EMAIL_INDEX,
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: { ":email": String(email) },
  };

  const result = await ddb.send(new QueryCommand(params));
//   console.log("findUserByEmail result:", result);
  return result.Items?.[0] || null;
}

/**
 * Find a user by userId (uses PK + SK)
 * @param {string} userId
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function findUserById(userId) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userId}`,
      SK: "PROFILE",
    },
  };

  const result = await ddb.send(new GetCommand(params));
  return result.Item || null;
}

/**
 * Create a new user
 * @param {Object} data
 * @param {string} data.username
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} [data.role]
 * @returns {Promise<Object>} Created user
 */
export async function createUser({ username, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();

  const user = {
    PK: `USER#${userId}`,
    SK: "PROFILE",
    userId,
    username,
    email,
    passwordHash,
    role: role || "user",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    profileImage: `https://cdn.app/avatar/${userId}.png`,
    settings: {
      notifications: true,
      theme: "light",
    },
  };

  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: user }));
  return user;
}

/**
 * Update an existing user
 * @param {string} userId
 * @param {Object} updates Fields to update (can include password)
 * @returns {Promise<Object>} Updated user
 */
export async function updateUser(userId, updates) {
  const expressions = [];
  const values = {};
  const names = {};

  for (const key in updates) {
    if (key === "password") {
      expressions.push("#passwordHash = :passwordHash");
      values[":passwordHash"] = await bcrypt.hash(updates.password, 10);
      names["#passwordHash"] = "passwordHash";
    } else {
      expressions.push(`#${key} = :${key}`);
      values[`:${key}`] = updates[key];
      names[`#${key}`] = key;
    }
  }

  if (expressions.length === 0) return findUserById(userId);

  const params = {
    TableName: TABLE_NAME,
    Key: { PK: `USER#${userId}`, SK: "PROFILE" },
    UpdateExpression: "SET " + expressions.join(", "),
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ReturnValues: "ALL_NEW",
  };

  const result = await ddb.send(new UpdateCommand(params));
  return result.Attributes;
}

/**
 * Delete a user by userId
 * @param {string} userId
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteUser(userId) {
  const params = {
    TableName: TABLE_NAME,
    Key: { PK: `USER#${userId}`, SK: "PROFILE" },
  };

  await ddb.send(new DeleteCommand(params));
  return true;
}
