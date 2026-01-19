// routes/aiChatWithHistory.routes.js
import express from "express";
import { aichatWithHistory } from "../controllers/chatHistory.controller.js";
import { generateAISummaryController } from "../controllers/ai.controller.js";

const router = express.Router();

// 新建 or 继续一个 chat（chatId 不传就新建）
router.post("/chat", aichatWithHistory);
router.post("/summary", generateAISummaryController);

export default router;
