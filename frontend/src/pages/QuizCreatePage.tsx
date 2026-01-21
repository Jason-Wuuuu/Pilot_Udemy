import { useState } from "react";
import { v4 as uuid } from "uuid";

type Question = {
  questionId: string;
  prompt: string;
  options: string[];
  answer: string;
  explains?: string;
};

const mockAIGenerate = async (count: number): Promise<Question[]> => {
  return Array.from({ length: count }).map((_, idx) => ({
    questionId: uuid(),
    prompt: `Sample AI Question ${idx + 1}: What does JVM stand for?`,
    options: [
      "Java Virtual Machine",
      "Java Variable Method",
      "Joint Virtual Model",
      "Java Verified Module",
    ],
    answer: "Java Virtual Machine",
    explains: "JVM stands for Java Virtual Machine.",
  }));
};

export default function QuizCreatePage() {
  const [activeTab, setActiveTab] = useState<"general" | "questions">(
    "general"
  );

  //AI generate
  const [aiQuestionCount, setAiQuestionCount] = useState("5");

  // General
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [timeLimit, setTimeLimit] = useState<number | "">("");

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIGenerate = async () => {
    const nRaw = parseInt(aiQuestionCount || "0", 10);
    const n = Number.isFinite(nRaw) ? Math.min(Math.max(nRaw, 1), 50) : 5;

    setAiLoading(true);
    const aiQuestions = await mockAIGenerate(n);
    setQuestions(aiQuestions);
    setAiLoading(false);
    setActiveTab("questions");
  };

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

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Create Quiz</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure quiz settings and manage questions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-base-200 p-1 rounded-lg w-fit">
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition
            ${
              activeTab === "general"
                ? "bg-base-100 shadow"
                : "opacity-60 hover:opacity-100"
            }
          `}
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
            }
          `}
          onClick={() => setActiveTab("questions")}
        >
          Questions ({questions.length})
        </button>
      </div>

      {/* =========================
          General Tab
      ========================== */}
      {activeTab === "general" && (
        <form className="card bg-base-100 shadow p-6 space-y-6">
          {/* Title */}
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-600">
              Quiz Title
            </label>
            <input
              className="input input-bordered h-11 font-medium focus:ring-2 focus:ring-primary"
              placeholder="e.g. Java Fundamentals Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Difficulty */}
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-600">
              Difficulty
            </label>
            <select
              className="select select-bordered h-11 font-medium"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          {/* Time Limit */}
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-600">
              Time Limit
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input input-bordered h-11 font-medium w-40"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
              />
              <span className="text-sm text-gray-500">seconds</span>
            </div>
          </div>
        </form>
      )}

      {/* =========================
          Questions Tab
      ========================== */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          {/* Top Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {questions.length} question(s)
            </div>

            <div className="flex items-center gap-3">
              {/* Question count input */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">AI count</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="input input-bordered h-9 w-20 font-medium text-center"
                  value={aiQuestionCount}
                  onChange={(e) => {
                    const v = e.target.value;
                    // 允许空字符串（用户正在编辑）
                    if (v === "") return setAiQuestionCount("");
                    // 只允许纯数字
                    if (/^\d+$/.test(v)) setAiQuestionCount(v);
                  }}
                  placeholder="5"
                />
                <span className="text-xs text-gray-500">1–50</span>
              </div>

              <button
                className="btn btn-outline btn-accent"
                onClick={handleAIGenerate}
                disabled={aiLoading}
              >
                {aiLoading ? "Generating..." : "AI Generate"}
              </button>

              <button className="btn btn-primary" onClick={addEmptyQuestion}>
                + Add Question
              </button>
            </div>
          </div>

          {/* Question Editor */}
          {questions.map((q, index) => (
            <div
              key={q.questionId}
              className="card bg-base-100 shadow p-6 space-y-4"
            >
              <div className="font-semibold">Question {index + 1}</div>

              {/* Prompt */}
              <textarea
                className="textarea textarea-bordered min-h-[80px] font-medium"
                placeholder="Enter question prompt"
                value={q.prompt}
                onChange={(e) =>
                  updateQuestion(q.questionId, {
                    prompt: e.target.value,
                  })
                }
              />

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className={`input input-bordered flex-1 font-medium
                        ${
                          opt === q.answer
                            ? "border-success ring-1 ring-success"
                            : ""
                        }
                      `}
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...q.options];
                        newOpts[i] = e.target.value;
                        updateQuestion(q.questionId, {
                          options: newOpts,
                        });
                      }}
                    />
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        opt === q.answer ? "btn-success" : "btn-outline"
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
              </div>

              {/* Explanation */}
              <textarea
                className="textarea textarea-bordered text-sm"
                placeholder="Explanation (optional)"
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
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button className="btn btn-outline">Save Draft</button>
        <button className="btn btn-primary">Publish Quiz</button>
      </div>
    </div>
  );
}
