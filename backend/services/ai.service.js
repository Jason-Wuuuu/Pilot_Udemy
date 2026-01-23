//--------------------------------------------Generate Summary-------------------------------------//
import axios from "axios";
import { extractTextFromPDFBuffer } from "../ai/genminiUtils.js";
import { generateSummary } from "../ai/genminiUtils.js";

export const generateAISummaryService = async ({
  user,
  downloadUrl,
  mimeType,
}) => {
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.statusCode = 401;
    throw err;
  }

  // 拉文件（重点：arraybuffer）
  const res = await axios.get(downloadUrl, {
    responseType: "arraybuffer",
  });

  let text = "";

  //  按类型处理
  if (mimeType?.includes("pdf")) {
    const buffer = Buffer.from(res.data);
    const { text: pdfText } = await extractTextFromPDFBuffer(buffer);
    text = pdfText;
  } else {
    // 默认当文本
    text = res.data.toString("utf-8");
  }

  if (!text || text.trim().length < 50) {
    const err = new Error("Material content too short to summarize");
    err.statusCode = 400;
    throw err;
  }

  // ③ AI summary
  const summary = await generateSummary(text);

  return { summary };
};

//----------------------------------------Explain Concept--------------------------------------//
