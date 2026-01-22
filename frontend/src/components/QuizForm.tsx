import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";

type Question = {
  questionId: string;
  prompt: string;
  options: string[];
  answer: string;
  explains?: string;
};

type QuizFormProps = {
  mode: "create" | "edit";
  courseId: string;
  initialData?: {
    title: string;
    difficulty: string;
    timeLimit?: number;
    questions: Question[];
  };
  onSubmit: (payload: {
    title: string;
    difficulty: string;
    timeLimit?: number | "";
    questions: Question[];
  }) => Promise<void>;
};

export default function QuizForm({
  mode,
  courseId,
  initialData,
  onSubmit,
}: QuizFormProps) {
  const [activeTab, setActiveTab] = useState<"general" | "questions">(
    "general"
  );

  // General
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [timeLimit, setTimeLimit] = useState<number | "">("");

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Edit 模式初始化
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title);
      setDifficulty(initialData.difficulty);
      setTimeLimit(initialData.timeLimit ?? "");
      setQuestions(initialData.questions);
    }
  }, [mode, initialData]);

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

  const validate = () => {
    if (!title.trim()) {
      toast.error("Quiz title is required");
      return false;
    }

    if (questions.length === 0) {
      toast.error("At least one question is required");
      return false;
    }

    if (timeLimit !== "") {
      if (!Number.isInteger(timeLimit) || timeLimit <= 0) {
        toast.error("Time limit must be a positive integer");
        return false;
      }
    }

    for (const q of questions) {
      if (!q.prompt.trim()) {
        toast.error("Question prompt cannot be empty");
        return false;
      }
      if (q.options.some((o) => !o.trim())) {
        toast.error("All options must be filled");
        return false;
      }
      if (!q.answer) {
        toast.error("Each question must have a correct answer");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title,
        difficulty,
        timeLimit,
        questions,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "Create Quiz" : "Edit Quiz"}
        </h1>
        <div className="text-sm text-gray-500">
          Course:
          <span className="ml-1 font-medium text-gray-800">{courseId}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-base-200 p-1 rounded-lg w-fit">
        {["general", "questions"].map((t) => (
          <button
            key={t}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === t ? "bg-base-100 shadow" : "opacity-60"
            }`}
            onClick={() => setActiveTab(t as any)}
          >
            {t === "general" ? "General" : `Questions (${questions.length})`}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === "general" && (
        <div className="card bg-base-100 shadow p-6 space-y-6">
          <input
            className="input input-bordered font-medium"
            placeholder="Quiz title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="select select-bordered font-medium"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <input
            type="number"
            className="input input-bordered font-medium w-40"
            placeholder="Time limit (seconds)"
            value={timeLimit}
            onChange={(e) =>
              setTimeLimit(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>
      )}

      {/* Questions */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          <button className="btn btn-primary" onClick={addEmptyQuestion}>
            + Add Question
          </button>

          {questions.map((q, idx) => (
            <div
              key={q.questionId}
              className="card bg-base-100 shadow p-6 space-y-4"
            >
              <div className="flex justify-between">
                <div className="font-semibold">Question {idx + 1}</div>
                <button
                  className="btn btn-ghost btn-sm text-error"
                  onClick={() => removeQuestion(q.questionId)}
                >
                  Remove
                </button>
              </div>

              <textarea
                className="textarea textarea-bordered"
                value={q.prompt}
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
                placeholder="Explanation"
                value={q.explains || ""}
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
      <div className="flex justify-end">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {mode === "create" ? "Publish Quiz" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
