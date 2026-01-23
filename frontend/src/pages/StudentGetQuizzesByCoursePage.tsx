import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { getQuizzesByCourse } from "../services/quiz.service";
import QuizCard from "../components/QuizCard";
import type { QuizListItem } from "../types/quiz";

type CourseQuizItem = {
  quizId: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  timeLimit?: number | null;
  createdAt: string;

  completed: boolean;
  score: number | null;
  submissionId: string | null;
};

type CourseQuizResponse = {
  courseId: string;
  title: string; // course title
  quizzes: CourseQuizItem[];
};

export default function StudentCourseQuizListPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<CourseQuizResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState<"newest" | "title">("newest");

  useEffect(() => {
    if (!courseId) return;

    (async () => {
      try {
        const res = await getQuizzesByCourse(courseId);
        const payload = (res?.data ?? res) as CourseQuizResponse;
        setData(payload);
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 403) toast.error("You are not enrolled in this course");
        else if (status === 404) toast.error("Course not found");
        else toast.error("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const quizzes = useMemo(() => {
    if (!data) return [];

    const adapted: QuizListItem[] = data.quizzes.map((q) => ({
      quizId: q.quizId,
      title: q.title,
      createdAt: q.createdAt,
      difficulty: q.difficulty as "Easy" | "Medium" | "Hard",
      courseId: data.courseId,
      courseTitle: data.title,

      hasSubmitted: q.completed,
      submission: q.completed
        ? {
          submissionId: q.submissionId!,
          quizId: q.quizId,
          score: q.score!,
          createdAt: q.createdAt,
        }
        : undefined,
    }));

    // 关键：排序在这里
    adapted.sort((a, b) => {
      if (sort === "title") {
        return a.title.localeCompare(b.title);
      }

      // newest：createdAt 越大越前
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return adapted;
  }, [data, sort]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      <button
        className="btn btn-ghost btn-sm mb-6"
        onClick={() => navigate(`/courses/${courseId}/dashboard`

          
        )}
      >
        ← Back to Courses
      </button>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Quizzes</p>
        </div>

        <select
          className="select select-bordered w-full sm:w-48 font-medium"
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
        >
          <option value="newest">Newest</option>
          <option value="title">Title (A–Z)</option>
        </select>
      </div>

      {/* Quiz Grid */}
      {quizzes.length === 0 ? (
        <div className="alert alert-info">No quizzes available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.quizId} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}
