import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getQuizById, submitQuiz } from "../services/quiz.service";
import QuestionCard from "../components/QuestionCard";

type Quiz = Awaited<ReturnType<typeof getQuizById>>;

export default function QuizTakePage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getQuizById(quizId!);
      setQuiz(data);
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

  const question = quiz.questions[current];
  const answeredCount = Object.keys(answers).length;

  const onSelect = (option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question.questionId]: option,
    }));
  };

  const onSubmit = async () => {
    setSubmitting(true);

    const payload = Object.entries(answers).map(
      ([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      })
    );

    const res = await submitQuiz(quiz.quizId, payload);
    navigate(`/submissions/${res.submissionId}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>

        <progress
          className="progress progress-primary mt-3"
          value={current + 1}
          max={quiz.questions.length}
        />

        <p className="text-sm opacity-60 mt-1">
          Question {current + 1} / {quiz.questions.length} · {answeredCount}{" "}
          answered
        </p>
      </div>

      {/* Question */}
      <QuestionCard
        question={question}
        index={current}
        total={quiz.questions.length}
        selected={answers[question.questionId]}
        onSelect={onSelect}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <button
          className="btn btn-outline"
          disabled={current === 0 || submitting}
          onClick={() => setCurrent((c) => c - 1)}
        >
          Previous
        </button>

        {current === quiz.questions.length - 1 ? (
          <button
            className="btn btn-primary"
            disabled={submitting}
            onClick={onSubmit}
          >
            {submitting && (
              <span className="loading loading-spinner loading-sm mr-2" />
            )}
            Submit Quiz
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setCurrent((c) => c + 1)}
            disabled={submitting}
          >
            Next
          </button>
        )}
      </div>

      {/* Question Index */}
      <div className="flex flex-wrap gap-2 mt-6 justify-center">
        {quiz.questions.map((q, i) => (
          <button
            key={q.questionId}
            className={`btn btn-xs ${
              i === current
                ? "btn-primary"
                : answers[q.questionId]
                ? "btn-success btn-outline"
                : "btn-ghost"
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
