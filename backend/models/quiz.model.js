import { z } from "zod";

export const CreateQuizSchema = z
  .object({
    // 由后端生成：不让客户端传
    // quizId: z.string().optional(),

    title: z.string().min(1),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    timeLimit: z.number().int().positive().optional(),
    courseId: z.string().min(1),

    questions: z
      .array(
        z.object({
          questionId: z.string().min(1),
          prompt: z.string().min(1),
          options: z.array(z.string().min(1)).min(2),
          explains: z.string().optional(),
          answer: z.string().min(1),
        })
      )
      .min(1),
  })
  .strict();

export const UpdateQuizSchema = z
  .object({
    title: z.string().min(1).optional(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
    timeLimit: z.number().int().positive().optional(),
    questions: z
      .array(
        z.object({
          questionId: z.string().min(1),
          prompt: z.string().min(1),
          options: z.array(z.string().min(1)).min(2),
          explains: z.string().optional(),
          answer: z.string().min(1),
        })
      )
      .optional(),
  })
  .strict();
