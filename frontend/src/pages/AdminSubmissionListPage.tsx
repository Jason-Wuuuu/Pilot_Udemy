import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { getSubmissionsByQuiz } from "../services/quiz.service";

/* =======================
   Types
======================= */

type SubmissionOverviewItem = {
  userId: string;
  studentName?: string;
  status: "SUBMITTED" | "NOT_SUBMITTED";
  submissionId: string | null;
  score: number | null;
  correctCount: number | null;
  totalCount: number | null;
  createdAt?: string;
};

type SubmissionOverviewResponse = {
  quizId: string;
  title: string;
  totalStudents: number;
  submissions: SubmissionOverviewItem[];
};

/* =======================
   Page
======================= */

export default function AdminSubmissionListPage() {
  const { courseId, quizId } = useParams<{
    courseId: string;
    quizId: string;
  }>();
  const navigate = useNavigate();

  const [data, setData] = useState<SubmissionOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /* =======================
     Load Data
  ======================= */

  useEffect(() => {
    if (!quizId) return;

    async function load() {
      try {
        const res = await getSubmissionsByQuiz(quizId!);
        setData(res);
      } catch {
        toast.error("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [quizId]);

  /* =======================
     Stats (defensive)
  ======================= */

  const stats = useMemo(() => {
    const submissions = data?.submissions ?? [];

    const submitted = submissions.filter((s) => s.status === "SUBMITTED");

    const avgScore =
      submitted.length === 0
        ? 0
        : Math.round(
            submitted.reduce((sum, s) => sum + (s.score ?? 0), 0) /
              submitted.length
          );

    return {
      submittedCount: submitted.length,
      notSubmittedCount:
        (data?.totalStudents ?? submissions.length) - submitted.length,
      avgScore,
      hasAnySubmission: submitted.length > 0,
    };
  }, [data]);

  /* =======================
     Loading
  ======================= */

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!data) return null;

  /* =======================
     Render
  ======================= */

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* ---------- Header ---------- */}
      <div className="space-y-2">
        <button
          className="btn btn-ghost btn-sm -ml-2 px-2"
          onClick={() => navigate(`/admin/courses/${courseId}/quizzes`)}
        >
          ← Back to Quizzes
        </button>

        <h1 className="text-3xl font-bold">Submissions · {data.title}</h1>

        <p className="text-sm text-gray-500">
          Review quiz participation and performance
        </p>
      </div>

      {/* ---------- Stats ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <p className="text-sm text-gray-500">Submitted</p>
            <p className="text-3xl font-bold">{stats.submittedCount}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <p className="text-sm text-gray-500">Not Submitted</p>
            <p className="text-3xl font-bold">{stats.notSubmittedCount}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <p className="text-sm text-gray-500">Average Score</p>
            <p className="text-3xl font-bold">{stats.avgScore}%</p>
          </div>
        </div>
      </div>

      {/* ---------- Empty Hint ---------- */}
      {!stats.hasAnySubmission && (
        <div className="alert alert-info">
          No students have submitted this quiz yet
        </div>
      )}

      {/* ---------- Table (ALWAYS RENDER) ---------- */}
      <div className="overflow-x-auto rounded-xl shadow bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Score</th>
              <th>Correct</th>
              <th>Submitted At</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {(data.submissions ?? []).map((s) => (
              <tr
                key={s.userId}
                className={`hover ${
                  s.status === "NOT_SUBMITTED" ? "opacity-60" : ""
                }`}
              >
                <td className="font-medium">{s.studentName || s.userId}</td>

                <td>
                  <span
                    className={`badge ${
                      s.status === "SUBMITTED" ? "badge-success" : "badge-ghost"
                    }`}
                  >
                    {s.status === "SUBMITTED" ? "Submitted" : "Not Submitted"}
                  </span>
                </td>

                <td>
                  {s.status === "SUBMITTED" ? (
                    <span
                      className={`badge ${
                        (s.score ?? 0) >= 80
                          ? "badge-success"
                          : (s.score ?? 0) >= 60
                          ? "badge-warning"
                          : "badge-error"
                      }`}
                    >
                      {s.score}%
                    </span>
                  ) : (
                    "—"
                  )}
                </td>

                <td>
                  {s.correctCount !== null
                    ? `${s.correctCount} / ${s.totalCount}`
                    : "—"}
                </td>

                <td className="text-sm text-gray-500">
                  {s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}
                </td>

                <td className="text-right">
                  {s.status === "SUBMITTED" ? (
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => navigate(`/submissions/${s.submissionId}`)}
                    >
                      View
                    </button>
                  ) : (
                    <button className="btn btn-sm btn-disabled">—</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
