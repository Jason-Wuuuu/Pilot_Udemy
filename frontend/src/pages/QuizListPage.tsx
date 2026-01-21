import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getMyQuizzes, getMySubmissions } from "../services/quiz.service";
import type { Quiz, Submission, QuizListItem } from "../types/quiz";
import QuizCard from "../components/QuizCard";

type Filter = "all" | "completed" | "not-started";

export default function QuizListPage() {
  const [items, setItems] = useState<QuizListItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [quizRes, submissionRes] = await Promise.all([
        getMyQuizzes(),
        getMySubmissions(),
      ]);

      const quizzes: Quiz[] = quizRes ?? [];
      const submissions: Submission[] = submissionRes ?? [];

      const submissionMap = new Map<string, Submission>();
      submissions.forEach((s) => submissionMap.set(s.quizId, s));

      const merged = quizzes.map((q) => ({
        ...q,
        hasSubmitted: submissionMap.has(q.quizId),
        submission: submissionMap.get(q.quizId),
      }));

      setItems(
        merged.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setLoading(false);
    }

    load();
  }, []);

  const visibleItems = items.filter((q) => {
    if (filter === "completed") return q.hasSubmitted;
    if (filter === "not-started") return !q.hasSubmitted;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Quizzes</h1>

        {/* Filter */}
        <div className="join">
          <button
            className={`btn btn-sm join-item ${
              filter === "all" ? "btn-active" : ""
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`btn btn-sm join-item ${
              filter === "completed" ? "btn-active" : ""
            }`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
          <button
            className={`btn btn-sm join-item ${
              filter === "not-started" ? "btn-active" : ""
            }`}
            onClick={() => setFilter("not-started")}
          >
            Not Started
          </button>
        </div>
      </div>

      {/* Grid */}
      {visibleItems.length === 0 ? (
        <div className="alert alert-info">No quizzes</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleItems.map((quiz) => (
            <QuizCard key={quiz.quizId} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}
