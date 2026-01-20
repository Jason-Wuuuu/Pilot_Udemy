import { Link } from "react-router-dom";
import type { QuizListItem } from "../types/quiz";

const difficultyStyle: Record<string, string> = {
  Easy: "badge-success",
  Medium: "badge-warning",
  Hard: "badge-error",
};

export default function QuizCard({ quiz }: { quiz: QuizListItem }) {
  const completed = quiz.hasSubmitted;
  const difficulty = quiz.difficulty ?? "Easy";

  return (
    <div
      className={`relative rounded-xl border bg-base-100 p-5 shadow-sm transition-all
        hover:-translate-y-1 hover:shadow-lg
        ${completed ? "border-success/40 bg-success/5" : "border-base-300"}
      `}
    >
      {/* Top right status */}
      {completed && (
        <div className="absolute top-3 right-3 badge badge-success badge-outline text-xs">
          Completed
        </div>
      )}

      {/* Title */}
      <h2 className="text-lg font-semibold leading-snug line-clamp-2 mb-2">
        {quiz.title}
      </h2>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`badge badge-sm ${difficultyStyle[difficulty]}`}>
          {difficulty}
        </span>
        <span className="text-xs opacity-60">
          {" "}
          Created {new Date(quiz.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="flex-1" />

      {/* Progress / score */}
      {completed ? (
        <div className="mb-3 text-sm font-medium text-success">
          Score · {quiz.submission!.score}%{" "}
          {quiz.submission?.attempt && `(Attempt ${quiz.submission.attempt})`}
        </div>
      ) : (
        <div className="mb-3 text-sm opacity-60">Not started</div>
      )}

      {/* Action */}
      {completed ? (
        <Link
          to={`/submissions/${quiz.submission!.submissionId}`}
          className="btn btn-success btn-sm w-full"
        >
          View Result
        </Link>
      ) : (
        <Link
          to={`/quizzes/${quiz.quizId}`}
          className="btn btn-primary btn-sm w-full"
        >
          Start Quiz
        </Link>
      )}
    </div>
  );
}
