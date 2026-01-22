import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getQuizById } from "../services/quiz.service";
import QuestionCard from "../components/QuestionCard";

export default function QuizPreviewPage() {
  const { courseId, quizId } = useParams<{
    courseId: string;
    quizId: string;
  }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getQuizById(quizId!);
      setQuiz(res);
      setLoading(false);
    }
    load();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          className="btn btn-ghost btn-sm -ml-2"
          onClick={() => navigate(`/admin/courses/${courseId}/quizzes`)}
        >
          ← Back to Quizzes
        </button>

        <h1 className="text-2xl font-bold mt-2">Preview: {quiz.title}</h1>

        <p className="text-sm text-gray-500 mt-1">
          This is a read-only preview for admins
        </p>
      </div>

      <QuestionCard
        question={quiz.questions[current]}
        index={current}
        total={quiz.questions.length}
        selected={undefined}
        onSelect={() => {}}
      />

      {/* Navigation only */}
      <div className="flex justify-between mt-6">
        <button
          className="btn btn-outline"
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
        >
          Previous
        </button>

        <button
          className="btn btn-outline"
          disabled={current === quiz.questions.length - 1}
          onClick={() => setCurrent((c) => c + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
