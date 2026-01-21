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

//this is quiz take page
export async function getQuizById(quizId: string) {
  return {
    quizId,
    title: "Java Basics Quiz",
    questions: [
      {
        questionId: "q1",
        prompt: "What is JVM?",
        options: [
          "Java Virtual Machine",
          "Java Variable Method",
          "Joint Virtual Memory",
          "None of the above",
        ],
      },
      {
        questionId: "q2",
        prompt: "Which keyword is used to inherit a class in Java?",
        options: ["this", "super", "extends", "implements"],
      },
    ],
  };
}

export async function submitQuiz(
  quizId: string,
  answers: { questionId: string; selectedAnswer: string }[]
) {
  // mock submissionId
  return { submissionId: "sub_mock_001" };
}

//Result Detail Page
// services/submission.mock.ts
export async function getSubmissionById(submissionId: string) {
  return {
    submissionId,
    quizId: "quiz_001",
    score: 50,
    correctCount: 1,
    totalCount: 2,
    questions: [
      {
        questionId: "q1",
        prompt: "What is JVM?",
        options: [
          "Java Virtual Machine",
          "Java Variable Method",
          "Joint Virtual Memory",
        ],
        yourAnswer: "Java Variable Method",
        correctAnswer: "Java Virtual Machine",
        explains: "JVM is the runtime that executes Java bytecode.",
        isCorrect: false,
      },
      {
        questionId: "q2",
        prompt: "Which keyword is used to inherit a class in Java?",
        options: ["this", "super", "extends", "implements"],
        yourAnswer: "extends",
        correctAnswer: "extends",
        explains: "extends is used for class inheritance.",
        isCorrect: true,
      },
    ],
  };
}
