import { generateAISummaryService } from "../services/ai.service.js";
export const generateAISummaryController = async (req, res) => {
  try {
    const { downloadUrl, mimeType } = req.body;
    const user = req.user;

    if (!downloadUrl) {
      const err = new Error("downloadUrl is required");
      err.statusCode = 400;
      throw err;
    }

    const result = await generateAISummaryService({
      user,
      downloadUrl,
      mimeType,
    });

    res.json(result);
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
};
