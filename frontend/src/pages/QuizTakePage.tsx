import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { getQuizById, submitQuiz } from "../services/quiz.service";
import QuestionCard from "../components/QuestionCard";
import toast from "react-hot-toast";

type Quiz = Awaited<ReturnType<typeof getQuizById>>;

export default function QuizTakePage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unansweredCount = quiz
    ? quiz.questions.length - Object.keys(answers).length
    : 0;

  useEffect(() => {
    async function load() {
      const data = await getQuizById(quizId!);
      setQuiz(data);
      if (data.timeLimit) {
        setRemainingTime(data.timeLimit);
      }
      setLoading(false);
    }
    load();
  }, [quizId]);

  //Timers
  useEffect(() => {
    if (remainingTime === null) return;
    if (submitting) return;

    //时间到自动交
    if (remainingTime <= 0) {
      onAutoSubmit();
      return;
    }

    timerRef.current = setTimeout(() => {
      setRemainingTime((t) => (t !== null ? t - 1 : t));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [remainingTime, submitting]);

  //avoid refresh to refresh the page
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

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

  const doSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);

    const payload = Object.entries(answers).map(
      ([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      }),
    );

    try {
      const res = await submitQuiz(quiz.quizId, payload);

      toast.success("Quiz submitted successfully");

      navigate(`/submissions/${res.submissionId}`);
    } catch (err: any) {
      //只交一次
      const status = err?.response?.status;

      if (status === 403) {
        toast.error("You are not enrolled in this course");
        navigate("/courses");
      } else if (status === 404) {
        toast.error("Quiz not found");
      } else {
        toast.error("Failed to load quiz");
      }
    }
  };

  //手动提交
  const onSubmit = () => {
    if (unansweredCount > 0) {
      const confirmed = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`,
      );

      if (!confirmed) return;
    }
    doSubmit();
  };

  const onAutoSubmit = () => {
    toast.error("Time is up. Submitting quiz...");
    doSubmit();
  };

  //timer
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>

        {/* 计时器 */}
        {remainingTime !== null && (
          <p className="text-sm font-medium mt-1 text-error">
            Time remaining: {formatTime(remainingTime)}
          </p>
        )}

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
        {quiz.questions.map((q: any, i: any) => (
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
