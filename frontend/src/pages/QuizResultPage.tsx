import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSubmissionById } from "../services/quiz.service";
import { QuestionResultCard } from "../components/QuestionResultCard";

export default function QuizResultDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0); // 👈 分页状态

  useEffect(() => {
    async function load() {
      const res = await getSubmissionById(submissionId!);
      setData(res);
      setLoading(false);
    }
    load();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!data) return null;

  const total = data.questions.length;
  const question = data.questions[current];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Score Summary（保持不变） */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body items-center text-center">
          <h2 className="text-3xl font-bold">{data.score}%</h2>
          <p className="text-slate-500">
            {data.correctCount} / {data.totalCount} correct
          </p>
          <progress
            className="progress progress-primary w-full"
            value={data.correctCount}
            max={data.totalCount}
          />
        </div>
      </div>

      {/* 单题结果（分页核心） */}
      <QuestionResultCard q={question} />

      {/* Prev / Next */}
      <div className="flex justify-between items-center">
        <button
          className="btn btn-outline"
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
        >
          Previous
        </button>

        <span className="text-sm opacity-60">
          Question {current + 1} / {total}
        </span>

        <button
          className="btn btn-outline"
          disabled={current === total - 1}
          onClick={() => setCurrent((c) => c + 1)}
        >
          Next
        </button>
      </div>

      {/* Question Index（跳题） */}
      <div className="flex flex-wrap gap-2 justify-center">
        {data.questions.map((q: any, i: number) => (
          <button
            key={q.questionId}
            className={`btn btn-xs ${
              i === current
                ? "btn-primary"
                : q.isCorrect
                ? "btn-success btn-outline"
                : "btn-error btn-outline"
            }`}
            onClick={() => setCurrent(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
