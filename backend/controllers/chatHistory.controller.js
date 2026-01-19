// controllers/aiChatWithHistory.controller.js
import { aiChatWithHistoryService } from "../services/chatHistory.service.js";

export const aichatWithHistory = async (req, res, next) => {
  try {
    const data = await aiChatWithHistoryService(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
