// repositories/chatHistory.repo.js
import {
  PutCommand,
  QueryCommand,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddb } from "../config/dynamodb.js";

const TABLE = "ChatHistory";

const nowIso = () => new Date().toISOString();
const chatPk = (chatId) => `CHAT#${chatId}`;
const userGsiPk = (userId) => `USER#${userId}`;

// 生成一个简单 chatId（你也可以换成 uuid）
export const newChatId = () =>
  `chat_${Date.now()}_${Math.random().toString(16).slice(2)}`;

// 1) 创建 chat meta（只创建一次）
export const createChatMeta = async ({ chatId, userId, documentId }) => {
  const t = nowIso();
  const item = {
    PK: chatPk(chatId),
    SK: "META",
    chatId,
    userId,
    documentId: documentId || null,
    createdAt: t,
    updatedAt: t,
    // GSI1: 按 user 查 chats
    GSI1PK: userGsiPk(userId),
    GSI1SK: `UPDATED#${t}`,
  };

  await ddb.send(
    new PutCommand({
      TableName: TABLE,
      Item: item,
      // 防止重复创建（可选）
      ConditionExpression:
        "attribute_not_exists(PK) AND attribute_not_exists(SK)",
    })
  );

  return item;
};

// 2) 追加一条 message（每次请求写 2 条：user + assistant）
export const appendMessage = async ({
  chatId,
  role,
  content,
  relevantChunks = [],
}) => {
  const t = nowIso();
  const item = {
    PK: chatPk(chatId),
    SK: `MSG#${t}#${role.toUpperCase()}`,
    role,
    content,
    timestamp: t,
    relevantChunks,
  };

  await ddb.send(
    new PutCommand({
      TableName: TABLE,
      Item: item,
    })
  );

  // 同步更新 META.updatedAt（让 GSI 按最近排序）
  await ddb.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: chatPk(chatId), SK: "META" },
      UpdateExpression: "SET updatedAt = :t, GSI1SK = :g",
      ExpressionAttributeValues: {
        ":t": t,
        ":g": `UPDATED#${t}`,
      },
    })
  );

  return item;
};

// 3) 读一个 chat 的全部消息（META + MSG）
export const getChat = async ({ chatId }) => {
  const resp = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": chatPk(chatId) },
    })
  );

  const items = resp.Items || [];
  const meta = items.find((x) => x.SK === "META") || null;
  const messages = items
    .filter((x) => String(x.SK).startsWith("MSG#"))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return { meta, messages };
};

// 4) 按 userId 列出 chats（只查 META）
export const listChatsByUser = async ({ userId, limit = 20 }) => {
  const resp = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1PK = :pk",
      ExpressionAttributeValues: { ":pk": userGsiPk(userId) },
      ScanIndexForward: false, // UPDATED desc
      Limit: limit,
    })
  );

  return resp.Items || [];
};

// 5) 读取 META（判断 chat 是否存在）
export const getChatMeta = async ({ chatId }) => {
  const resp = await ddb.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: chatPk(chatId), SK: "META" },
    })
  );
  return resp.Item || null;
};
