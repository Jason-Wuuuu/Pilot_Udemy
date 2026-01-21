export interface Homework {
  id: number;
  tutorId: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  submissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: string;
  homeworkId: string;
  studentId: string;
  text: string;
  fileUrl?: string;
  score: number | null;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}
