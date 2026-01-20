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
  user,
  documentId,
  chatId,
  question,
  materialText,
}) => {
  // ===== Auth =====
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.statusCode = 401;
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

  // ===== Chat ownership =====
  let finalChatId = chatId;

  if (!finalChatId) {
    // new chat
    finalChatId = newChatId();
    await createChatMeta({
      chatId: finalChatId,
      userId: user.userId,
      documentId,
    });
  } else {
    // existing chat must belong to user
    const meta = await getChatMeta({ chatId: finalChatId });

    if (!meta) {
      const err = new Error("chatId not found");
      err.statusCode = 404;
      throw err;
    }

    if (meta.userId !== user.userId) {
      const err = new Error("FORBIDDEN");
      err.statusCode = 403;
      throw err;
    }
  }

  // ===== Retrieval =====
  const chunks = chunkText(text);
  const relevantChunks = findRelevantChunks(chunks, question, 3);
  const finalChunks = relevantChunks.length
    ? relevantChunks
    : chunks.slice(0, 3);

  // ===== LLM =====
  const answer = await chatWithContext(question, finalChunks);
  const usedChunkIndices = finalChunks.map((c) => c.chunkIndex);

  // ===== Persist messages =====
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
