// routes/aiChatWithHistory.routes.js
import express from "express";
import { aichatWithHistory } from "../controllers/chatHistory.controller.js";
import { generateAISummaryController } from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "tmp/" });

// 新建 or 继续一个 chat（chatId 不传就新建）
router.post("/chat", authenticate, aichatWithHistory);
router.post(
  "/summary",
  authenticate,
  upload.single("file"),
  generateAISummaryController
);

export default router;
