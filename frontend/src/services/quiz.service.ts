// src/services/quiz.service.ts
// import { API_PATHS } from "../utils/apiPaths.ts";

// export const quizService = {
//   getMyQuizzes() {
//     return apiClient.get(API_PATHS.QUIZ.MY_QUIZZES);
//   },

//   getQuizById(quizId: string) {
//     return apiClient.get(API_PATHS.QUIZ.BY_ID(quizId));
//   },

//   submitQuiz(quizId: string, answers) {
//     return apiClient.post(API_PATHS.QUIZ.SUBMIT(quizId), { answers });
//   },
// };

// src/services/quiz.service.ts
export async function getAllQuizzes() {
  return Promise.resolve([
    {
      quizId: "quiz_1",
      title: "Java Basics",
      createdAt: "2024-01-10T10:00:00Z",
    },
    {
      quizId: "quiz_2",
      title: "Spring Boot",
      createdAt: "2024-01-05T10:00:00Z",
    },
  ]);
}

// src/services/submission.service.ts
export async function getMySubmissions() {
  return Promise.resolve([
    {
      submissionId: "sub_1",
      quizId: "quiz_1",
      score: 85,
      createdAt: "2024-01-11T09:00:00Z",
    },
  ]);
}
