import crypto from "crypto";
import { getQuizByIdController } from "../controllers/quiz.controller.js";
import {
  getQuizByIdRepo,
  createQuizRepo,
  updateQuizByIdRepo,
  getQuizzesByUserIdRepo,
  deleteQuizByIdRepo,
} from "../repositories/quiz.repo.js";

//---------------------------------------------------------------------------------//
export const getQuizByIdService = async (quizId, role = "student") => {
  const quiz = await getQuizByIdRepo(quizId);

  if (!quiz) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  // student 只能看 published
  if (role === "student") {
    return toStudentQuizView(quiz);
  }

  // admin 看完整 quiz
  return quiz;
};

export const createQuizService = async (payload) => {
  const quiz = {
    quizId: `quiz_${crypto.randomUUID()}`,
    userId: payload.userId,
    title: payload.title,
    difficulty: payload.difficulty,
    questions: payload.questions,
    createdAt: new Date().toISOString(),
  };

  return createQuizRepo(quiz);
};

export const updateQuizByIdService = async (quizId, payload) => {
  const existing = await getQuizByIdRepo(quizId);
  if (!existing) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  return updateQuizByIdRepo(quizId, payload);
};

export const deleteQuizByIdService = async (quizId) => {
  const existing = await getQuizByIdController(quizId);
  if (!existing) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  await deleteQuizByIdRepo(quizId);
};

export const getQuizzesByUserIdService = async (userId) => {
  return getQuizzesByUserIdRepo(userId);
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
