// src/services/quiz.service.ts
import api from "../api/axios";
import { API_PATHS } from "../utils/apiPath";

// src/services/quiz.service.ts
export async function getMyQuizzes() {
  const res = await api.get(API_PATHS.QUIZ.MY_QUIZZES);
  return res.data;
}

// src/services/submission.service.ts
export async function getMySubmissions() {
  const res = await api.get(API_PATHS.SUBMISSION.MY_HISTORY);
  return res.data;
}

//this is quiz take page
export async function getQuizById(quizId: string) {
  const res = await api.get(API_PATHS.QUIZ.BY_ID(quizId));
  return res.data;
}

export async function submitQuiz(
  quizId: string,
  answers: { questionId: string; selectedAnswer: string }[]
) {
  const res = await api.post(API_PATHS.QUIZ.SUBMIT(quizId), { answers });

  return res.data; // { submissionId }
}

//Result Detail Page
export async function getSubmissionById(submissionId: string) {
  const res = await api.get(API_PATHS.SUBMISSION.BY_ID(submissionId));
  return res.data;
}

// Create Quiz（Admin)
export async function createQuiz(payload: {
  courseId: string;
  title: string;
  difficulty: string;
  timeLimit?: number | "";
  questions: {
    questionId: string;
    prompt: string;
    options: string[];
    answer: string;
    explains?: string;
  }[];
}) {
  const res = await api.post(API_PATHS.QUIZ.CREATE, payload);
  return res.data; // { quizId }
}

// Admin / Instructor: get quizzes by course
export async function getQuizzesByCourse(courseId: string) {
  const res = await api.get(API_PATHS.QUIZ.COURSE(courseId));
  return res.data;
}

//Admin update quizzes
export async function updateQuiz(
  quizId: string,
  payload: {
    title: string;
    difficulty: string;
    timeLimit?: number | "";
    questions: {
      questionId: string;
      prompt: string;
      options: string[];
      answer: string;
      explains?: string;
    }[];
  }
) {
  const res = await api.put(API_PATHS.QUIZ.BY_ID(quizId), payload);
  return res.data;
}

//Delete
export async function deleteQuiz(quizId: string) {
  await api.delete(API_PATHS.QUIZ.BY_ID(quizId));
}

// Admin / Instructor: get submissions by quiz
export async function getSubmissionsByQuiz(quizId: string) {
  const res = await api.get(API_PATHS.SUBMISSION.ALL_STUDENT(quizId));
  return res.data;
}

//Student: get quizzes by course
export async function studentGetQuizzesByCourse(courseId: string) {
  if (!courseId) {
    throw new Error("courseId is required");
  }

  const res = await api.get(API_PATHS.QUIZ.COURSE(courseId));
  return res.data;
}

//AI Generate

export async function aiGenerateQuizPreview(payload: FormData) {
  const res = await api.post(API_PATHS.QUIZ.AI_GENERATE, payload);
  return res.data;
}
