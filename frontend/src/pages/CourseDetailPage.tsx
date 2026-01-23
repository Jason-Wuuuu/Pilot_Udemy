import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import NavBar from "../components/NavBar";
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

function levelBadge(level: Course["level"]) {
  switch (level) {
    case "EASY":
      return "bg-green-400/90 text-black";
    case "INTERMEDIATE":
      return "bg-yellow-400/90 text-black";
    case "ADVANCED":
      return "bg-red-400/90 text-black";
    default:
      return "bg-white/80 text-black";
  }
}

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [lecturesLoading, setLecturesLoading] = useState(true);

  const [creatingLecture, setCreatingLecture] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [deletingLecture, setDeletingLecture] = useState<Lecture | null>(null);

  /* =========================
     Fetch course + lectures
     ========================= */
  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    setLecturesLoading(true);

    Promise.all([
      getCourseById(courseId),
      getLecturesByCourseId(courseId),
    ])
      .then(([courseData, lectureData]) => {
        setCourse(courseData);

        // IMPORTANT: sort by lectureOrder, but DO NOT display it
        setLectures(
          lectureData.sort((a, b) => a.lectureOrder - b.lectureOrder)
        );
      })
      .finally(() => {
        setLoading(false);
        setLecturesLoading(false);
      });
  }, [courseId]);

  const handleStartLearning = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/learn/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="bg-white min-h-screen">
      <NavBar />

      {/* =======================
          HERO
         ======================= */}
      <section className="w-full bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left */}
          <div className="lg:col-span-2">
            <button
              onClick={() => navigate("/courses")}
              className="text-sm font-medium text-white/80 hover:text-white mb-8 transition"
            >
              ← Back to all courses
            </button>

            <div className="flex gap-3 mb-6">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${levelBadge(
                  course.level
                )}`}
              >
                {course.level}
              </span>
              <span className="px-3 py-1 rounded-full border border-white/50 text-xs">
                {course.categoryName}
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
              {course.courseName}
            </h1>

            <p className="text-lg text-white/90 max-w-3xl mb-8">
              {course.description}
            </p>

            <p className="text-sm text-white/80">
              Instructor:{" "}
              <span className="font-semibold">{course.instructor}</span>
            </p>
          </div>

          {/* Right CTA */}
          <div className="flex items-center">
            <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-3">
                Start learning today
              </h3>

              <p className="text-white/80 mb-6">
                Full access to all lectures and materials.
              </p>

              <button
                onClick={handleStartLearning}
                className="w-full py-4 rounded-full bg-white text-indigo-700 font-semibold text-lg hover:bg-gray-100 transition"
              >
                Start Learning
              </button>

              <p className="text-xs text-white/60 mt-4">
                Login required. Students & admins only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =======================
          LECTURES
         ======================= */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">What you’ll learn</h2>

            {isAdmin && (
              <button
                className="btn btn-primary btn-sm rounded-full"
                onClick={() => setCreatingLecture(true)}
              >
                + Add lecture
              </button>
            )}
          </div>

          {/* Empty state */}
          {!lecturesLoading && lectures.length === 0 && (
            <div className="rounded-2xl border border-dashed border-base-300 p-10 text-center bg-base-100">
              <p className="text-lg font-medium mb-2">
                This course is coming soon
              </p>
              <p className="text-base-content/60 mb-6">
                The instructor hasn’t added any lectures yet.
              </p>
            </div>
          )}

          {/* Lecture list */}
          {lectures.length > 0 && (
            <div className="space-y-4">
              {lectures.map((lecture, index) => (
                <div
                  key={lecture.lectureId}
                  className="
                    group flex items-start gap-5 p-5 rounded-2xl
                    bg-base-100 border border-base-300
                    hover:shadow-md hover:border-primary/30
                    transition-all
                  "
                >
                  {/* Display index (NOT lectureOrder) */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-lg md:text-xl font-semibold leading-snug mb-1">
                      {lecture.title}
                    </p>

                    {lecture.description && (
                      <p className="text-sm md:text-base text-base-content/60 leading-relaxed">
                        {lecture.description}
                      </p>
                    )}
                  </div>

                  {/* Admin actions */}
                  {isAdmin && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* =======================
          MODALS
         ======================= */}
      <LectureFormModal
        open={creatingLecture}
        onClose={() => setCreatingLecture(false)}
        onSubmit={async (payload) => {
          console.log(payload)
          const created = await createLecture(courseId!, payload);
          setLectures((prev) => [...prev, created]);
          setCreatingLecture(false);
        }}
      />

      {editingLecture && (
        <LectureFormModal
          open={!!editingLecture}
          initialData={editingLecture ?? undefined}
          onClose={() => setEditingLecture(null)}
          onSubmit={async (payload) => {
            if (!editingLecture) return;

            const updated = await updateLecture(
              courseId!,
              editingLecture.lectureId,
              payload
            );

            setLectures((prev) =>
              prev.map((l) =>
                l.lectureId === updated.lectureId ? updated : l
              )
            );
            setEditingLecture(null);
          }}
        />
      )}

      {deletingLecture && (
        <ConfirmDangerModal
          open={!!deletingLecture}
          title="Delete lecture"
          description={
            deletingLecture
              ? `Delete "${deletingLecture.title}"?`
              : ""
          }
          confirmText="Delete lecture"
          onClose={() => setDeletingLecture(null)}
          onConfirm={async () => {
            if (!deletingLecture) return;

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
