import { generateAISummaryService } from "../services/ai.service.js";

export const generateAISummaryController = async (req, res, next) => {
  try {
    const data = await generateAISummaryService({
      user: req.user,
      ...req.body,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
