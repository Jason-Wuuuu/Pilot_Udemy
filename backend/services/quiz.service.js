import crypto from "crypto";
import { getQuizByIdRepo, createQuizRepo } from "../repositories/quiz.repo.js";

export const getQuizByIdService = async (quizId) => {
  const quiz = await getQuizByIdRepo(quizId);
  if (!quiz) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }
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
