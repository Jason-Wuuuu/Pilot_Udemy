import crypto from "crypto";
import { getQuizByIdController } from "../controllers/quiz.controller.js";
import {
  getQuizByIdRepo,
  createQuizRepo,
  updateQuizByIdRepo,
  getQuizzesByUserIdRepo,
  deleteQuizByIdRepo,
} from "../repositories/quiz.repo.js";
import { aiGenerateQuiz } from "../ai/genminiUtils.js";

//---------------------------------------------------------------------------------//
export const getQuizByIdService = async ({ user, quizId }) => {
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.statusCode = 401;
    throw err;
  }

  const quiz = await getQuizByIdRepo(quizId);

  if (!quiz) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  // 非 admin → student view
  if (user.role !== "ADMIN") {
    return toStudentQuizView(quiz);
  }

  // admin → full quiz
  return quiz;
};

export const createQuizService = async ({ user, payload }) => {
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.statusCode = 401;
    throw err;
  }

  if (user.role !== "ADMIN") {
    const err = new Error("FORBIDDEN");
    err.statusCode = 403;
    throw err;
  }

  const quiz = {
    quizId: `quiz_${crypto.randomUUID()}`,
    userId: user.userId, // ✅ 来自 auth user
    title: payload.title,
    difficulty: payload.difficulty,
    timeLimit: payload.timeLimit,
    questions: payload.questions,
    createdAt: new Date().toISOString(),
  };

  return createQuizRepo(quiz);
};

export const updateQuizByIdService = async ({ user, quizId, payload }) => {
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.statusCode = 401;
    throw err;
  }

  if (user.role !== "ADMIN") {
    const err = new Error("FORBIDDEN");
    err.statusCode = 403;
    throw err;
  }

  const existing = await getQuizByIdRepo(quizId);
  if (!existing) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  // Step 2：这里才能判断是不是 admin / owner
  return updateQuizByIdRepo(quizId, payload);
};

export const deleteQuizByIdService = async ({ user, quizId }) => {
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.statusCode = 401;
    throw err;
  }

  if (user.role !== "ADMIN") {
    const err = new Error("FORBIDDEN");
    err.statusCode = 403;
    throw err;
  }

  const existing = await getQuizByIdRepo(quizId);
  if (!existing) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  // Step 2：权限判断
  await deleteQuizByIdRepo(quizId);
};

export const getMyQuizzesService = async ({ user }) => {
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.statusCode = 401;
    throw err;
  }

  // admin → 看全部（或以后扩展）
  if (user.role === "ADMIN") {
    return getAllQuizzesRepo();
  }

  // 普通用户 → 只看自己的
  return getQuizzesByUserIdRepo(user.userId);
};

//-----------------------------------------------Student--------------------------------------//
//Student View
function toStudentQuizView(quiz) {
  return {
    quizId: quiz.quizId,
    title: quiz.title,
    difficulty: quiz.difficulty,
    questions: quiz.questions.map((q) => ({
      questionId: q.questionId,
      prompt: q.prompt,
      options: q.options,
    })),
  };
}

//--------------------------------------------AI--------------------------------------//
export const aiGenerateQuizService = async (payload) => {
  const {
    materialText,
    numQuestions = 5,
    difficulty = "Easy",
    timeLimit,
  } = payload;

  console.log("materialText type:", typeof materialText, materialText);

  if (!materialText) {
    const err = new Error("materialText is required");
    err.statusCode = 400;
    throw err;
  }

  const questions = await aiGenerateQuiz(materialText, numQuestions);

  if (!questions.length) {
    throw new Error("AI failed to generate questions");
  }

  return {
    title: "AI Generated Quiz",
    difficulty,
    timeLimit,
    questions,
  };
};
