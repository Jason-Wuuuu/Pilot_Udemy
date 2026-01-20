//--------------------------------------------Generate Summary-------------------------------------//
import { generateSummary } from "../ai/genminiUtils.js";

export const generateAISummaryService = async ({ user, materialText }) => {
  // ===== Auth =====
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.statusCode = 401;
    throw err;
  }

  if (!materialText) {
    const err = new Error("materialText is required");
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

  const summary = await generateSummary(text);

  return {
    summary,
  };
};

//----------------------------------------Explain Concept--------------------------------------//
