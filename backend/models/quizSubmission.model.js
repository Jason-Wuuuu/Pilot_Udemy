import { z } from "zod";

export const CreateSubmissionSchema = z
  .object({
    userId: z.string().min(1),
    answers: z
      .array(
        z.object({
          questionId: z.string().min(1),
          selectedAnswer: z.string().min(1),
        })
      )
      .min(1),
  })
  .strict();
