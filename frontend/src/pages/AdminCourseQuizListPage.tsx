import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { getQuizzesByCourse, deleteQuiz } from "../services/quiz.service";

type QuizItem = {
  quizId: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  timeLimit?: number | null;
  createdAt: string;
};

type CourseQuizResponse = {
  courseId: string;
  title: string;
  quizzes: QuizItem[];
};

export default function AdminCourseQuizList() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<CourseQuizResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [difficulty, setDifficulty] = useState<
    "all" | "Easy" | "Medium" | "Hard"
  >("all");
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
        if (status === 403) toast.error("FORBIDDEN");
        else if (status === 404) toast.error("Course not found");
        else toast.error("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const onDelete = async (quiz: QuizItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${quiz.title}"?\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteQuiz(quiz.quizId);
      console.log(quiz.quizId);
      toast.success("Quiz deleted");

      // 本地移除（不重新请求）
      setData((prev) =>
        prev
          ? {
              ...prev,
              quizzes: prev.quizzes.filter((q) => q.quizId !== quiz.quizId),
            }
          : prev
      );
    } catch {
      toast.error("Failed to delete quiz");
    }
  };

  const quizzes = useMemo(() => {
    if (!data) return [];

    const kw = keyword.trim().toLowerCase();

    const filtered = data.quizzes.filter((q) => {
      const matchTitle = q.title.toLowerCase().includes(kw);
      const matchDiff = difficulty === "all" || q.difficulty === difficulty;
      return matchTitle && matchDiff;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sorted;
  }, [data, keyword, difficulty, sort]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage quizzes under this course: {courseId}
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() =>
            navigate(`/admin/courses/${data.courseId}/quizzes/create`)
          }
        >
          + Create Quiz
        </button>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow">
        <div className="card-body gap-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <input
              className="input input-bordered w-full lg:w-80 font-medium"
              placeholder="Search quiz title..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

            <select
              className="select select-bordered font-medium w-full lg:w-48"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
            >
              <option value="all">All difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              className="select select-bordered font-medium w-full lg:w-48"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
            >
              <option value="newest">Newest</option>
              <option value="title">Title (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quiz Table */}
      {quizzes.length === 0 ? (
        <div className="alert alert-info">No quizzes found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Time Limit</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((q) => (
                <tr key={q.quizId} className="hover">
                  <td className="font-medium">{q.title}</td>

                  <td>
                    <span
                      className={`badge ${
                        q.difficulty === "Easy"
                          ? "badge-success"
                          : q.difficulty === "Medium"
                          ? "badge-warning"
                          : "badge-error"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </td>

                  <td>
                    {q.timeLimit ? `${Math.floor(q.timeLimit / 60)} min` : "—"}
                  </td>

                  <td className="text-sm text-gray-500">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>

                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() =>
                          navigate(
                            `/admin/courses/${data.courseId}/quizzes/${q.quizId}/edit`
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() =>
                          navigate(
                            `/admin/courses/${data.courseId}/quizzes/${q.quizId}/preview`
                          )
                        }
                      >
                        Preview
                      </button>

                      {/* More */}
                      <div className="dropdown dropdown-end">
                        <label
                          tabIndex={0}
                          className="btn btn-sm btn-ghost px-2"
                          title="More actions"
                        >
                          ⋯
                        </label>

                        <ul
                          tabIndex={0}
                          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48"
                        >
                          <li>
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/courses/${courseId}/quizzes/${q.quizId}/submissions`
                                )
                              }
                            >
                              View Submissions
                            </button>
                          </li>

                          <li className="text-error">
                            <button onClick={() => onDelete(q)}>Delete</button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
