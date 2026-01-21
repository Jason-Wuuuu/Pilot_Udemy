export const API_PATHS = {
  QUIZ: {
    MY_QUIZZES: "/api/quizzes/me",
    BY_ID: (quizId: string) => `/api/quizzes/${quizId}`,
    SUBMIT: (quizId: string) => `/api/quizzes/${quizId}/submissions`,
    SUBMISSIONS_BY_QUIZ: (quizId: string) =>
      `/api/quizzes/${quizId}/submissions`,
  },

  SUBMISSION: {
    MY_HISTORY: "/api/submissions/me",
    BY_ID: (submissionId: string) => `/api/submissions/${submissionId}`,
  },

  AI: {
    CHAT: "/api/ai/chat",
    SUMMARY: "/api/ai/summary",
  },
};
