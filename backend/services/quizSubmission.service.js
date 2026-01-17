import { v4 as uuidv4 } from "uuid";
import { getQuizByIdRepo } from "../repositories/quiz.repo.js";
import {
  createSubmissionRepo,
  getQuizSubmissionsByUserRepo,
  getSubmissionsByQuizRepo,
  getSubmissionByIdRepo,
} from "../repositories/quizSubmission.repo.js";

//Get submissions history for the student
export const getQuizSubmissionsByUserService = async (userId) => {
  if (!userId) {
    const err = new Error("userId is required");
    err.statusCode = 400;
    throw err;
  }

  const submissions = await getQuizSubmissionsByUserRepo(userId);

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
export const getSubmissionsByQuizService = async (quizId) => {
  // 确认 quiz 存在
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
export const getSubmissionByIdService = async (submissionId) => {
  const submission = await getSubmissionByIdRepo(submissionId);

  if (!submission) {
    const err = new Error("Submission not found");
    err.statusCode = 404;
    throw err;
  }

  const quiz = await getQuizByIdRepo(submission.quizId);
  if (!quiz) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  // 组装“结果视图”
  const questions = quiz.questions.map((q) => {
    const ans = submission.answers.find((a) => a.questionId === q.questionId);

    const isCorrect = ans && ans.selectedAnswer === q.answer;

    return {
      questionId: q.questionId,
      prompt: q.prompt,
      options: q.options,
      yourAnswer: ans?.selectedAnswer,
      correctAnswer: q.answer,
      explanation: q.Explains,
      isCorrect,
    };
  });

  return {
    submissionId: submission.submissionId,
    quizId: submission.quizId,
    userId: submission.userId,
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
      explanation: q.explains,
    });
  });

  let correctCount = 0;

  const detailed = answers.map((a) => {
    const correct = correctMap.get(a.questionId);
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
export const submitQuizService = async (quizId, payload) => {
  const quiz = await getQuizByIdRepo(quizId);

  if (!quiz) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  const graded = gradeQuiz(quiz, payload.answers);

  //存DB
  const submission = {
    submissionId: `sub_${uuidv4()}`,
    quizId,
    userId: payload.userId,
    answers: payload.answers,
    score: graded.score,
    correctCount: graded.correctCount,
    totalCount: graded.totalCount,
    createdAt: new Date().toISOString(),
  };

  await createSubmissionRepo(submission);

  // Result View（只返回给学生，不存 DB）
  return {
    submissionId: submission.submissionId,
    quizId,
    score: graded.score,
    correctCount: graded.correctCount,
    totalCount: graded.totalCount,
    questions: graded.detailed,
  };
};
