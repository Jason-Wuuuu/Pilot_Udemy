// services/aiChatWithHistory.service.js
import { chunkText, findRelevantChunks } from "../ai/textchunker.js";
import { chatWithContext } from "../ai/genminiUtils.js";
import {
  newChatId,
  createChatMeta,
  appendMessage,
  getChatMeta,
} from "../repositories/chatHistory.repo.js";

export const aiChatWithHistoryService = async ({
  userId,
  documentId,
  chatId,
  question,
  materialText,
}) => {
  if (!userId) {
    const err = new Error("userId is required (no auth yet)");
    err.statusCode = 400;
    throw err;
  }
  if (!question) {
    const err = new Error("question is required");
    err.statusCode = 400;
    throw err;
  }
  if (!materialText) {
    const err = new Error(
      "materialText is required (material table not integrated yet)"
    );
    err.statusCode = 400;
    throw err;
  }

  let text = materialText;
  if (Array.isArray(text)) text = text.join("\n\n");
  if (typeof text !== "string") {
    const err = new Error("materialText must be string or string[]");
    err.statusCode = 400;
    throw err;
  }

  // 1) 确定 chatId：没传就新建
  let finalChatId = chatId;
  if (!finalChatId) {
    finalChatId = newChatId();
    await createChatMeta({ chatId: finalChatId, userId, documentId });
  } else {
    // chatId 传了就必须存在
    const meta = await getChatMeta({ chatId: finalChatId });
    if (!meta) {
      const err = new Error("chatId not found");
      err.statusCode = 404;
      throw err;
    }
  }

  // 2) retrieval（你要的完整版）
  const chunks = chunkText(text);
  const relevantChunks = findRelevantChunks(chunks, question, 3);
  const finalChunks = relevantChunks.length
    ? relevantChunks
    : chunks.slice(0, 3);

  // 3) LLM
  const answer = await chatWithContext(question, finalChunks);
  const usedChunkIndices = finalChunks.map((c) => c.chunkIndex);

  // 4) 每轮写两条 message
  await appendMessage({
    chatId: finalChatId,
    role: "user",
    content: question,
    relevantChunks: [],
  });
  await appendMessage({
    chatId: finalChatId,
    role: "assistant",
    content: answer,
    relevantChunks: usedChunkIndices,
  });

  return {
    chatId: finalChatId,
    question,
    answer,
    relevantChunks: usedChunkIndices,
  };
};
