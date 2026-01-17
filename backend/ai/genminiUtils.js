import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
        Explains: explains,
      });
    }
  }

  return questions.slice(0, numQuestions);
};
