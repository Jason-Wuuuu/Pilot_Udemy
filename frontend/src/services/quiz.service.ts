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

  console.log(res.data);
  return res.data;
}
