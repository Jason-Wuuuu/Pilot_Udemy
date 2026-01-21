export const API_PATHS = {
  QUIZ: {
    CREATE: "/quizzes", //Post
    MY_QUIZZES: "/quizzes/me", // GET
    BY_ID: (quizId: string) => `/quizzes/${quizId}`, // GET / PUT / DELETE
    AI_GENERATE: "/quizzes/aigenerate", // POST
    SUBMIT: (quizId: string) => `/quizzes/${quizId}/submissions`, // POST
  },

  SUBMISSION: {
    MY_HISTORY: "/submissions", // GET    //既能看到有分数 又能看到没分数
    BY_ID: (submissionId: string) => `/submissions/${submissionId}`, // GET
    BY_QUIZ: (quizId: string) => `/submissions/by-quiz/${quizId}`, // GET
  },

  AI: {
    CHAT: "/ai/chat",
    SUMMARY: "/ai/summary",
  },
};
