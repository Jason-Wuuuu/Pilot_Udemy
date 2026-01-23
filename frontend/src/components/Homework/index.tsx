import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import HomeworkForm from "./HomeworkForm";
import HomeworkCard from "./HomeworkCard";
import { useHomeworks } from "../../hooks/useHomeworks";
import { useAppSelector } from "../../store/hooks";
import type { Homework } from "../../types/homework";

export default function Homework() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const notOverdue = searchParams.get("notOverdue") === "true";
  const user = useAppSelector((state) => state.auth.user);
  const { homeworks, coursesWithHomeworks, loading, error, refetch } =
    useHomeworks(lectureId || null, user?.id, notOverdue, user?.role);
  const [showForm, setShowForm] = useState<{
    mode: "create" | "update";
    homework?: Homework;
  } | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!loading && isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [loading]);

  if (!user)
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-gray-500">Please log in to view homeworks.</div>
      </div>
    );

  if (loading && isInitialLoad.current)
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div>Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );

  const handleFormSuccess = () => {
    setShowForm(null);
    refetch();
  };

  const handleDelete = async (homeworkId: number) => {
    if (!confirm("Are you sure you want to delete this homework?")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/homeworks/${homeworkId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tutorId: user.id }),
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      refetch();
    } catch (error) {
      console.error("Failed to delete homework:", error);
    }
  };

  const handleToggleNotOverdue = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (notOverdue) {
      newSearchParams.delete("notOverdue");
    } else {
      newSearchParams.set("notOverdue", "true");
    }
    setSearchParams(newSearchParams);
  };

  return (
    <>
      <dialog className={`modal ${showForm ? "modal-open" : ""}`}>
        <div className="modal-box w-11/12 max-w-2xl max-h-[90vh] p-0">
          {showForm && lectureId && (
            <HomeworkForm
              mode={showForm.mode}
              courseId={lectureId}
              homeworkId={showForm.homework?.id.toString()}
              initialData={
                showForm.homework
                  ? {
                      title: showForm.homework.title,
                      description: showForm.homework.description,
                      dueDate: showForm.homework.dueDate,
                    }
                  : undefined
              }
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(null)}
            />
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={() => setShowForm(null)}>
            close
          </button>
        </form>
      </dialog>
      <div className="@container w-full h-full p-2 @sm:p-3 @md:p-4">
        {lectureId && (
          <div className="flex items-center justify-between mb-6 shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-ghost btn-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <div></div>
          </div>
        )}
        <div className="flex items-center justify-between mb-2 @sm:mb-3 @md:mb-4 px-1">
          <h1 className="text-lg @sm:text-2xl @md:text-3xl font-bold">
            {lectureId
              ? `Homeworks (${homeworks.length})`
              : user.role === "ADMIN"
                ? `All Homeworks (${homeworks.length})`
                : `My Homeworks (${homeworks.length})`}
          </h1>
          <div className="flex items-center gap-2 @sm:gap-3">
            {loading && !isInitialLoad.current && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            {!lectureId && user.role !== "ADMIN" && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notOverdue}
                  onChange={handleToggleNotOverdue}
                  className="checkbox checkbox-primary checkbox-sm"
                  disabled={loading}
                />
                <span className="text-sm @sm:text-base">Hide Overdue</span>
              </label>
            )}
            {user.role === "ADMIN" && lectureId && (
              <button
                onClick={() => setShowForm({ mode: "create" })}
                className="btn btn-success btn-sm @sm:btn-md"
              >
                Create Homework
              </button>
            )}
          </div>
        </div>

        {lectureId || (user.role === "ADMIN" && homeworks.length > 0) ? (
          <div className="grid grid-cols-1 @2xl:grid-cols-2 items-start gap-2 @sm:gap-3 @md:gap-4">
            {[...homeworks]
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime(),
              )
              .map((homework: Homework) => (
                <HomeworkCard
                  key={homework.id}
                  homework={homework}
                  onUpdate={() => setShowForm({ mode: "update", homework })}
                  onDelete={() => handleDelete(homework.id)}
                />
              ))}
          </div>
        ) : (
          <div className="space-y-6">
            {coursesWithHomeworks.length === 0 && homeworks.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No homeworks found. You are not enrolled in any courses with
                homeworks.
              </div>
            ) : (
              coursesWithHomeworks.map((courseGroup) => (
                <div
                  key={courseGroup.course.courseId}
                  className="space-y-3 p-4"
                >
                  <div className="border-b border-base-300 pb-2">
                    <h2 className="text-xl font-semibold">
                      {courseGroup.course.courseName} (
                      {courseGroup.homeworks.length})
                    </h2>
                    <p className="text-sm text-base-content/60">
                      {courseGroup.course.categoryName} •{" "}
                      {courseGroup.course.level} • Instructor:{" "}
                      {courseGroup.course.instructor}
                    </p>
                  </div>
                  {courseGroup.homeworks.length === 0 ? (
                    <div className="text-sm text-base-content/60 pl-4">
                      No homeworks for this course.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 @2xl:grid-cols-2 items-start gap-2 @sm:gap-3 @md:gap-4 pl-4">
                      {[...courseGroup.homeworks]
                        .sort(
                          (a, b) =>
                            new Date(a.createdAt).getTime() -
                            new Date(b.createdAt).getTime(),
                        )
                        .map((homework: Homework) => (
                          <HomeworkCard
                            key={homework.id}
                            homework={homework}
                            onUpdate={() =>
                              setShowForm({ mode: "update", homework })
                            }
                            onDelete={() => handleDelete(homework.id)}
                          />
                        ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
