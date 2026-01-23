import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//---------------------------------------------------quiz------------------------------------------------//
export const aiGenerateQuiz = async (text, numQuestions = 5) => {
  if (typeof text !== "string") {
    throw new Error("materialText must be a string");
  }
  const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
  Format each question as:
  Q: [Question]
  O1: [Option 1]
  O2: [Option 2]
  O3: [Option 3]
  O4: [Option 4]
  C: [Correct option - exactly as written above]
  E: [Brief explanation]
  
  Separate questions with "---"
  
  Text:
  ${text.substring(0, 15000)}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
  });

  const generatedText =
    response.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const questions = [];
  const blocks = generatedText.split("---").filter(Boolean);

  for (const block of blocks) {
    const lines = block.trim().split("\n");

    let promptText = "";
    let options = [];
    let answer = "";
    let explains = "";

    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith("Q:")) promptText = t.slice(2).trim();
      else if (t.match(/^O\d:/)) options.push(t.slice(3).trim());
      else if (t.startsWith("C:")) answer = t.slice(2).trim();
      else if (t.startsWith("E:")) explains = t.slice(2).trim();
    }

    if (promptText && options.length === 4 && answer) {
      questions.push({
        questionId: `q_${crypto.randomUUID()}`,
        prompt: promptText,
        options,
        answer,
        explains: explains,
      });
    }
  }

  return questions.slice(0, numQuestions);
};

//---------------------------------------------------------chat-------------------------------------------//
export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
    .join("\n\n");

  const prompt = `Based on the following context from a document, Analyse the context and answer the user's question accurately and concisely according to the context.
  If the answer is not in the context, say so.
  
  Context:
  ${context}
  
  Question: ${question}
  
  Answer:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to process chat request");
  }
};

//--------------------------------------------------------------Generate  Summary------------------------------//
export const generateSummary = async (text) => {
  if (Array.isArray(text)) {
    text = text.join("\n\n");
  }

  if (typeof text !== "string" || text.trim().length === 0) {
    const err = new Error("text must be a non-empty string");
    err.statusCode = 400;
    throw err;
  }

  const MAX_CHARS = 20000;

  const prompt = `
Provide a concise summary of the following text.
- Highlight key concepts and main ideas
- Keep the summary clear and structured
- Do NOT introduce information not present in the text

Text:
${text.slice(0, MAX_CHARS)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText =
      response.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("Empty AI response");
    }

    return generatedText;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate summary");
  }
};

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<{text: string, numPages: number}>}
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);

    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

export const extractTextFromDocx = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return {
      text: result.value,
    };
  } catch (e) {
    console.error("DOCX parsing error:", e);
    throw new Error("Failed to extract text from docx");
  }
};

/**
 * Extract text from PDF buffer
 * @param {Buffer} buffer
 */
export const extractTextFromPDFBuffer = async (buffer) => {
  try {
    const data = await pdfParse(buffer);

    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};
