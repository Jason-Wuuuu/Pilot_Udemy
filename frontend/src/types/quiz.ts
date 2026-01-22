export type Difficulty = "Easy" | "Medium" | "Hard";

export type Quiz = {
  quizId: string;
  title: string;
  createdAt: string;
  difficulty?: Difficulty;
  courseId: string;
  courseTitle: string;
};

export type Submission = {
  submissionId: string;
  quizId: string;
  score: number;
  createdAt: string;
  attempt?: number;
};

export type QuizListItem = Quiz & {
  hasSubmitted: boolean;
  submission?: Submission;
};
