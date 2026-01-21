import { v4 as uuidv4 } from "uuid";
import { getQuizByIdRepo } from "../repositories/quiz.repo.js";
import {
  createSubmissionRepo,
  getQuizSubmissionsByUserRepo,
  getSubmissionsByQuizRepo,
  getSubmissionByIdRepo,
} from "../repositories/quizSubmission.repo.js";

//Get submissions history for the student
export const getQuizSubmissionsByUserService = async ({ user }) => {
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.statusCode = 401;
    throw err;
  }

  if (user.role === "ADMIN") {
    const err = new Error("FORBIDDEN");
    err.statusCode = 403;
    throw err;
  }

  const submissions = await getQuizSubmissionsByUserRepo(user.userId);

  // Student History View（不含答案）
  return submissions.map((s) => ({
    submissionId: s.submissionId,
    quizId: s.quizId,
    score: s.score,
    correctCount: s.correctCount,
    totalCount: s.totalCount,
    createdAt: s.createdAt,
  }));
};

//Admin Get submission history for one quiz
export const getSubmissionsByQuizService = async ({ user, quizId }) => {
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

  const quiz = await getQuizByIdRepo(quizId);
  if (!quiz) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  const submissions = await getSubmissionsByQuizRepo(quizId);

  // Admin View：可以看到 answers
  return submissions.map((s) => ({
    submissionId: s.submissionId,
    userId: s.userId,
    score: s.score,
    correctCount: s.correctCount,
    totalCount: s.totalCount,
    answers: s.answers,
    createdAt: s.createdAt,
  }));
};

//Get Single Submission Detail
export const getSubmissionByIdService = async ({ user, submissionId }) => {
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.statusCode = 401;
    throw err;
  }

  const submission = await getSubmissionByIdRepo(submissionId);
  if (!submission) {
    const err = new Error("Submission not found");
    err.statusCode = 404;
    throw err;
  }

  // 权限判断
  if (user.role !== "ADMIN" && submission.userId !== user.userId) {
    const err = new Error("FORBIDDEN");
    err.statusCode = 403;
    throw err;
  }

  const quiz = await getQuizByIdRepo(submission.quizId);
  if (!quiz) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  const questions = quiz.questions.map((q) => {
    const ans = submission.answers.find((a) => a.questionId === q.questionId);

    const isCorrect = ans && ans.selectedAnswer === q.answer;

    return {
      questionId: q.questionId,
      prompt: q.prompt,
      options: q.options,
      yourAnswer: ans?.selectedAnswer,
      correctAnswer: user.role === "ADMIN" ? q.answer : undefined,
      explanation: q.explains,
      isCorrect,
    };
  });

  return {
    submissionId: submission.submissionId,
    quizId: submission.quizId,
    score: submission.score,
    correctCount: submission.correctCount,
    totalCount: submission.totalCount,
    createdAt: submission.createdAt,
    questions,
  };
};

//Submit quiz and grade  两张表查quiz 要answers 和 quizsubmission 的payload 答案对比
/**Grade function**/
const gradeQuiz = (quiz, answers) => {
  const correctMap = new Map();
  quiz.questions.forEach((q) => {
    correctMap.set(q.questionId, {
      answer: q.answer,
      explains: q.explains,
    });
  });

  let correctCount = 0;

  const detailed = answers.map((a) => {
    const correct = correctMap.get(a.questionId);

    if (!correct) {
      const err = new Error(`Invalid questionId: ${a.questionId}`);
      err.statusCode = 400;
      throw err;
    }

    const isCorrect = a.selectedAnswer === correct.answer;
    if (isCorrect) correctCount++;

    return {
      questionId: a.questionId,
      yourAnswer: a.selectedAnswer,
      correctAnswer: correct.answer,
      explains: correct.explains,
      isCorrect,
    };
  });

  const totalCount = quiz.questions.length;
  const score = Math.round((correctCount / totalCount) * 100);

  return { score, correctCount, totalCount, detailed };
};

/**Submit + Grade**/
export const submitQuizService = async ({ user, quizId, payload }) => {
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.statusCode = 401;
    throw err;
  }

  if (user.role === "ADMIN") {
    const err = new Error("FORBIDDEN");
    err.statusCode = 403;
    throw err;
  }

  const quiz = await getQuizByIdRepo(quizId);
  if (!quiz) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  const graded = gradeQuiz(quiz, payload.answers);

  const submission = {
    submissionId: `sub_${uuidv4()}`,
    quizId,
    userId: user.userId,
    answers: payload.answers,
    score: graded.score,
    correctCount: graded.correctCount,
    totalCount: graded.totalCount,
    createdAt: new Date().toISOString(),
  };

  await createSubmissionRepo(submission);

  // Student Result View
  return {
    submissionId: submission.submissionId,
    quizId,
    score: graded.score,
    correctCount: graded.correctCount,
    totalCount: graded.totalCount,
    questions: graded.detailed,
  };
};
