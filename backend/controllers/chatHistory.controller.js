// controllers/aiChatWithHistory.controller.js
import { aiChatWithHistoryService } from "../services/chatHistory.service.js";

export const aichatWithHistory = async (req, res, next) => {
  try {
    const data = await aiChatWithHistoryService({
      user: req.user,
      ...req.body,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
