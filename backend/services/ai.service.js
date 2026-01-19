//--------------------------------------------Generate Summary-------------------------------------//
import { generateSummary } from "../ai/genminiUtils.js";

export const generateAISummaryService = async ({ materialText }) => {
  if (!materialText) {
    const err = new Error("materialText is required");
    err.statusCode = 400;
    throw err;
  }

  const summary = await generateSummary(materialText);
  return { summary };
};
