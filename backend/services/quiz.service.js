import crypto from "crypto";
import { getQuizByIdController } from "../controllers/quiz.controller.js";
import {
  getQuizByIdRepo,
  createQuizRepo,
  updateQuizByIdRepo,
  deleteQuizByIdRepo,
  getAllQuizzesRepo,
  getQuizzesByCourseIdRepo,
  getAllCoursesRepo,
  getCoursesByStudentIdRepo,
} from "../repositories/quiz.repo.js";

import { getSubmissionByUserAndQuizRepo } from "../repositories/quizSubmission.repo.js";

import { getCourseById } from "../repositories/course.repo.js";

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

  // admin / instructor：全量
  if (user.role === "ADMIN") {
    return quiz;
  }

  // student：必须 enrolled 在 course
  const course = await getCourseById(quiz.courseId);

  if (!course) {
    const err = new Error("Course not found");
    err.statusCode = 404;
    throw err;
  }

  if (!Array.isArray(course.studentIds)) {
    const err = new Error("Course enrollment data corrupted");
    err.statusCode = 500;
    throw err;
  }

  const isEnrolled = course.studentIds.includes(user.userId);

  if (!isEnrolled) {
    const err = new Error("FORBIDDEN");
    err.statusCode = 403;
    throw err;
  }

  return toStudentQuizView(quiz);
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
    courseId: payload.courseId,
    creatorId: user.userId,
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

//All quizzes Student can get
export const getMyQuizzesService = async ({ user }) => {
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.statusCode = 401;
    throw err;
  }

  // admin → 全部
  if (user.role === "ADMIN") {
    return getAllQuizzesRepo();
  }

  // student → enrolled courses 下的 quizzes
  const courses = await getCoursesByStudentIdRepo(user.userId);

  const quizzes = [];
  for (const course of courses) {
    if (!course?.courseId) {
      console.warn("Invalid course item, skipped:", course);
      continue;
    }
    const qs = await getQuizzesByCourseIdRepo(course.courseId);
    for (const quiz of qs) {
      if (!quiz.courseId) {
        console.warn("Skipping quiz without courseId:", quiz.quizId);
        continue;
      }

      const submission = await getSubmissionByUserAndQuizRepo(
        user.userId,
        quiz.quizId
      );

      quizzes.push({
        courseId: course.courseId,
        courseTitle: course.title ? course.title : "Unknown",
        quizId: quiz.quizId,
        title: quiz.title,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        completed: !!submission,
        score: submission ? submission.score : null,
        submissionId: submission ? submission.submissionId : null,
      });
    }
  }

  return quizzes;
};

//-----------------------------------------------Student--------------------------------------//
//Student View
function toStudentQuizView(quiz) {
  return {
    quizId: quiz.quizId,
    title: quiz.title,
    difficulty: quiz.difficulty,
    timeLimit: quiz.timeLimit,
    questions: quiz.questions.map((q) => ({
      questionId: q.questionId,
      prompt: q.prompt,
      options: q.options,
    })),
  };
}

export const getMyCoursesWithQuizzesService = async ({ user }) => {
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.statusCode = 401;
    throw err;
  }

  //  拿课程
  const courses =
    user.role === "ADMIN"
      ? await getAllCoursesRepo()
      : await getCoursesByStudentIdRepo(user.userId);

  //  给每个 course 挂 quizzes
  const result = [];
  for (const course of courses) {
    const quizzes = await getQuizzesByCourseIdRepo(course.courseId);

    result.push({
      courseId: course.courseId,
      title: course.title,
      quizzes: quizzes.map((q) => ({
        quizId: q.quizId,
        title: q.title,
        difficulty: q.difficulty,
        timeLimit: q.timeLimit,
      })),
    });
  }

  return result;
};

//All under one course
export const getQuizzesByCourseService = async ({ user, courseId }) => {
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.statusCode = 401;
    throw err;
  }

  //  course 必须存在
  const course = await getCourseById(courseId);
  if (!course) {
    const err = new Error("Course not found");
    err.statusCode = 404;
    throw err;
  }

  //  权限判断
  if (user.role !== "ADMIN" && user.role !== "INSTRUCTOR") {
    const isEnrolled = course.studentIds.includes(user.userId);
    if (!isEnrolled) {
      const err = new Error("FORBIDDEN");
      err.statusCode = 403;
      throw err;
    }
  }

  //  查 quizzes
  const quizzes = await getQuizzesByCourseIdRepo(courseId);
  const result = [];
  for (const q of quizzes) {
    // admin / instructor 看 quiz 本身，不需要 submission
    let submission = null;

    if (user.role === "STUDENT") {
      submission = await getSubmissionByUserAndQuizRepo(user.userId, q.quizId);
    }

    result.push({
      quizId: q.quizId,
      title: q.title,
      difficulty: q.difficulty,
      timeLimit: q.timeLimit,
      createdAt: q.createdAt,

      completed: !!submission,
      score: submission ? submission.score : null,
      submissionId: submission ? submission.submissionId : null,
    });
  }

  return {
    courseId: course.courseId,
    title: course.title,
    quizzes: result,
  };
};

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
