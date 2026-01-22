import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { useParams, useNavigate } from "react-router";
import { getQuizById, updateQuiz } from "../services/quiz.service";
import toast from "react-hot-toast";

type Question = {
  questionId: string;
  prompt: string;
  options: string[];
  answer: string;
  explains?: string;
};

export default function QuizEditPage() {
  const { courseId, quizId } = useParams<{
    courseId: string;
    quizId: string;
  }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "questions">(
    "general"
  );

  // General
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [timeLimit, setTimeLimit] = useState<number | "">("");

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);

  // 🔑 加载已有 quiz
  useEffect(() => {
    async function load() {
      try {
        const quiz = await getQuizById(quizId!);

        setTitle(quiz.title);
        setDifficulty(quiz.difficulty);
        setTimeLimit(quiz.timeLimit ?? "");
        setQuestions(quiz.questions);
      } catch (e) {
        toast.error("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [quizId]);

  const updateQuestion = (id: string, patch: Partial<Question>) => {
    setQuestions((qs) =>
      qs.map((q) => (q.questionId === id ? { ...q, ...patch } : q))
    );
  };

  const addEmptyQuestion = () => {
    setQuestions((qs) => [
      ...qs,
      {
        questionId: uuid(),
        prompt: "",
        options: ["", "", "", ""],
        answer: "",
        explains: "",
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((qs) => qs.filter((q) => q.questionId !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Quiz title is required");
      return;
    }

    if (questions.length === 0) {
      toast.error("At least one question is required");
      return;
    }

    for (const q of questions) {
      if (!q.prompt.trim()) {
        toast.error("Question prompt cannot be empty");
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        toast.error("All options must be filled");
        return;
      }
      if (!q.answer) {
        toast.error("Each question must have a correct answer");
        return;
      }
    }

    try {
      await updateQuiz(quizId!, {
        title,
        difficulty,
        timeLimit,
        questions,
      });

      toast.success("Quiz updated");
      navigate(`/admin/courses/${courseId}/quizzes`);
    } catch (e) {
      toast.error("Failed to update quiz");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <button
          className="btn btn-ghost btn-sm -ml-2 px-2"
          onClick={() => navigate(`/admin/courses/${courseId}/quizzes`)}
        >
          ← Back to Quizzes
        </button>

        <h1 className="text-2xl font-bold">Edit Quiz</h1>

        <div className="text-sm text-gray-500">
          Course:
          <span className="ml-1 font-medium text-gray-800">{courseId}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-base-200 p-1 rounded-lg w-fit">
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition
            ${
              activeTab === "general"
                ? "bg-base-100 shadow"
                : "opacity-60 hover:opacity-100"
            }`}
          onClick={() => setActiveTab("general")}
        >
          General
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition
            ${
              activeTab === "questions"
                ? "bg-base-100 shadow"
                : "opacity-60 hover:opacity-100"
            }`}
          onClick={() => setActiveTab("questions")}
        >
          Questions ({questions.length})
        </button>
      </div>

      {/* General */}
      {activeTab === "general" && (
        <div className="card bg-base-100 shadow p-6 space-y-6">
          <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
            <label className="text-sm font-medium">Quiz Title</label>
            <input
              className="input input-bordered font-medium"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
            <label className="text-sm font-medium">Difficulty</label>
            <select
              className="select select-bordered font-medium"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
            <label className="text-sm font-medium">Time Limit</label>
            <input
              type="number"
              className="input input-bordered font-medium w-40"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* Questions */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          <button className="btn btn-primary" onClick={addEmptyQuestion}>
            + Add Question
          </button>

          {questions.map((q, index) => (
            <div
              key={q.questionId}
              className="card bg-base-100 shadow p-6 space-y-4"
            >
              <div className="flex justify-between">
                <div className="font-semibold">Question {index + 1}</div>
                <button
                  className="btn btn-ghost btn-sm text-error"
                  onClick={() => removeQuestion(q.questionId)}
                >
                  Remove
                </button>
              </div>

              <textarea
                className="textarea textarea-bordered font-medium"
                value={q.prompt}
                placeholder="Enter Prompt"
                onChange={(e) =>
                  updateQuestion(q.questionId, {
                    prompt: e.target.value,
                  })
                }
              />

              {q.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input input-bordered flex-1"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const opts = [...q.options];
                      opts[i] = e.target.value;
                      updateQuestion(q.questionId, {
                        options: opts,
                      });
                    }}
                  />
                  <button
                    className={`btn btn-sm ${
                      q.answer === opt ? "btn-success" : "btn-outline"
                    }`}
                    onClick={() =>
                      updateQuestion(q.questionId, {
                        answer: opt,
                      })
                    }
                  >
                    Correct
                  </button>
                </div>
              ))}

              <textarea
                className="textarea textarea-bordered text-sm"
                value={q.explains || ""}
                placeholder="Explanation (Optional)"
                onChange={(e) =>
                  updateQuestion(q.questionId, {
                    explains: e.target.value,
                  })
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          className="btn btn-ghost"
          onClick={() => navigate(`/admin/courses/${courseId}/quizzes`)}
        >
          Cancel
        </button>

        <button className="btn btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
