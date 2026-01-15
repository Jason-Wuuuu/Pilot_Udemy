import dotenv from "dotenv";
dotenv.config();

import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../db/dynamodb.js";

const run = async () => {
  const quiz = {
    quizId: "quiz_java_001",
    userId: "user_123",
    title: "Java Basic Quiz",
    difficulty: "Easy",
    questionCount: 2,
    createdAt: new Date().toISOString(),
    questions: [
      {
        questionId: "q_001",
        prompt: "What does JVM stand for?",
        options: [
          "Java Virtual Machine",
          "Java Variable Method",
          "Joint Vector Model",
          "Java Version Manager",
        ],
        answer: "Java Virtual Machine",
      },
      {
        questionId: "q_002",
        prompt: "Which keyword is used to inherit a class in Java?",
        options: ["this", "super", "extends", "implements"],
        answer: "extends",
      },
    ],
  };

  await ddb.send(
    new PutCommand({
      TableName: "Quiz",
      Item: quiz,
    })
  );

  console.log("Quiz seeded:", quiz.quizId);
};

run().catch(console.error);
