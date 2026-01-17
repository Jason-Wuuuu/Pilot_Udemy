import { z } from "zod";

export const CreateQuizSchema = z
  .object({
    // 由后端生成：不让客户端传
    // quizId: z.string().optional(),

    // Todo: 还没做 auth，可以临时允许 body 传 userId, 后面要auth来
    userId: z.string().min(1),

    title: z.string().min(1),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    timeLimit: z.number().int().positive().optional(),

    questions: z
      .array(
        z.object({
          questionId: z.string().min(1),
          prompt: z.string().min(1),
          options: z.array(z.string().min(1)).min(2),
          Explains: z.string().optional(),
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
          Explains: z.string().optional(),
          answer: z.string().min(1),
        })
      )
      .optional(),
  })
  .strict();
