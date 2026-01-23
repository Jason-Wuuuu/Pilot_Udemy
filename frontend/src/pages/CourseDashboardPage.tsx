import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  getCourseById,
  getLecturesByCourseId,
  createLecture,
  updateLecture,
  deleteLecture,
} from "../services/course.service";
import type { Course, Lecture } from "../types/course";
import { useAppSelector } from "../store/hooks";

import LectureFormModal from "../components/Courses/LectureFormModal";
import ConfirmDangerModal from "../components/Courses/ConfirmingDangerModal";

export default function CourseDashboardPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  const [creatingLecture, setCreatingLecture] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [deletingLecture, setDeletingLecture] = useState<Lecture | null>(null);

  /* =========================
     Fetch data
     ========================= */
  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    Promise.all([getCourseById(courseId), getLecturesByCourseId(courseId)])
      .then(([courseData, lectureData]) => {
        setCourse(courseData);
        setLectures(
          lectureData.sort((a, b) => a.lectureOrder - b.lectureOrder)
        );
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!course) return null;


  return (
    <div className="px-8 py-10">
      {/* Back */}
      <button
        className="btn btn-ghost btn-sm mb-6"
        onClick={() => navigate("/courses")}
      >
        ← Back to Courses
      </button>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">{course.courseName}</h1>
        <p className="text-base-content/70 mb-1">{course.description}</p>
        <p className="text-sm text-base-content/60">
          Instructor: {course.instructor}
        </p>
      </div>

      {/* =========================
         MAIN GRID
         ========================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* =====================
            LEFT: Lectures
           ===================== */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Course Content</h2>

            {isAdmin && (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setCreatingLecture(true)}
              >
                + Add lecture
              </button>
            )}
          </div>

          {lectures.length === 0 && (
            <div className="border border-dashed rounded-xl p-8 text-base-content/60">
              No lectures yet.
            </div>
          )}

          <div className="space-y-4">
            {lectures.map((lecture, index) => (
              <div
                key={lecture.lectureId}
                className="flex items-start justify-between p-5 rounded-xl border border-base-300 bg-base-100"
              >
                {/* Left */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  <div>
                    <p className="text-lg font-semibold">{lecture.title}</p>
                    {lecture.description && (
                      <p className="text-sm text-base-content/60">
                        {lecture.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                  <button
                    className="btn btn-sm btn-outline btn-neutral"
                    onClick={() =>
                      navigate(`/learn/courses/${courseId}`, {
                        state: { lectureId: lecture.lectureId },
                      })
                    }
                  >
                    Start Learning
                  </button>

                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() =>
                      navigate(`/homeworks/${lecture.lectureId}`)
                    }
                  >
                    Homework
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        className="btn btn-xs btn-ghost"
                        onClick={() => setEditingLecture(lecture)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-xs btn-ghost text-error"
                        onClick={() => setDeletingLecture(lecture)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =====================
            RIGHT: Dashboard
           ===================== */}
        <aside className="space-y-6">
          {/* Overview */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h3 className="font-semibold text-lg mb-2">Course Overview</h3>
              <p className="text-sm text-base-content/70">
                {lectures.length} lectures
              </p>
              <p className="text-sm text-base-content/70">
                Homework & quizzes included
              </p>
            </div>
          </div>

          {/* Quizzes */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h3 className="font-semibold text-lg mb-2">Quizzes</h3>
              <p className="text-sm text-base-content/70 mb-4">
                Test your understanding with course quizzes.
              </p>
              <button
                className="btn btn-primary w-full"
                onClick={() => navigate(isAdmin
                  ? `/admin/courses/${courseId}/quizzes`
                  : `/courses/${courseId}/quizzes`)}
              >
                Go to Quizzes
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* =======================
          MODALS
         ======================= */}
      <LectureFormModal
        open={creatingLecture}
        onClose={() => setCreatingLecture(false)}
        onSubmit={async (payload) => {
          const created = await createLecture(courseId!, payload);
          setLectures((prev) => [...prev, created]);
          setCreatingLecture(false);
        }}
      />

      {editingLecture && (
        <LectureFormModal
          open
          initialData={editingLecture}
          onClose={() => setEditingLecture(null)}
          onSubmit={async (payload) => {
            const updated = await updateLecture(
              courseId!,
              editingLecture.lectureId,
              payload
            );
            setLectures((prev) =>
              prev.map((l) => (l.lectureId === updated.lectureId ? updated : l))
            );
            setEditingLecture(null);
          }}
        />
      )}

      {deletingLecture && (
        <ConfirmDangerModal
          open
          title="Delete lecture"
          description={`Delete "${deletingLecture.title}"?`}
          confirmText="Delete lecture"
          onClose={() => setDeletingLecture(null)}
          onConfirm={async () => {
            await deleteLecture(courseId!, deletingLecture.lectureId);
            setLectures((prev) =>
              prev.filter((l) => l.lectureId !== deletingLecture.lectureId)
            );
            setDeletingLecture(null);
          }}
        />
      )}
    </div>
  );
}
