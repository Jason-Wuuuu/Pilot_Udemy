import {
    getAllCourses, createCourse, updateCourse,
    deleteCourse,
} from "../services/course.service";
import { useEffect, useState } from "react";
import CourseCard from "../components/Courses/CourseCard";
import type { Course } from "../types/course";
import { useAppSelector } from "../store/hooks";
import CourseFormModal from "../components/Courses/CourseFormModal";
import ConfirmDangerModal from "../components/Courses/ConfirmingDangerModal"
import NavBar from "../components/NavBar";
import toast from "react-hot-toast";


export default function CourseListPage() {
    const user = useAppSelector((state) => state.auth.user);
    const isAdmin = user?.role === "ADMIN";

    const [courses, setCourses] = useState<Course[]>([]);
    const categories = Array.from(
        new Set(courses.map((c) => c.categoryName))
    );

    const [activeCategory, setActiveCategory] = useState<string>("ALL");
    const filteredCourses =
        activeCategory === "ALL"
            ? courses
            : courses.filter((c) => c.categoryName === activeCategory);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
    const [isCreating, setIsCreating] = useState(false);


    useEffect(() => {

        const fetchCourses = async () => {
            try {
                setLoading(true);
                const data = await getAllCourses();
                setCourses(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load courses");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-base-100 to-base-200">
            <NavBar/>
            <main className="max-w-7xl mx-auto px-6 py-12">

                {/* Hero / Header */}
                <section className="mb-12">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-bold leading-tight mb-4">
                            Learn skills that compound over time
                        </h1>
                        <p className="text-base-content/70 text-lg">
                            Structured courses designed to move you from fundamentals to
                            real-world confidence.
                        </p>
                    </div>

                    <div className="divider mt-8" />
                </section>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <span className="loading loading-spinner loading-lg text-primary" />
                        <p className="text-base-content/60">Loading courses…</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="max-w-xl mx-auto">
                        <div className="alert alert-error shadow-lg">
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Content */}
                {!loading && !error && (
                    <>
                        {/* Category Tabs */}
                        <div className="mb-10 overflow-x-auto">
                            <div className="tabs tabs-bordered w-max">
                                <button
                                    className={`tab ${activeCategory === "ALL" ? "tab-active" : ""}`}
                                    onClick={() => setActiveCategory("ALL")}
                                >
                                    All Courses
                                </button>

                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        className={`tab ${activeCategory === category ? "tab-active" : ""
                                            }`}
                                        onClick={() => setActiveCategory(category)}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredCourses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="text-6xl opacity-20 mb-6">📚</div>
                                <h3 className="text-xl font-semibold mb-2">
                                    No courses yet
                                </h3>
                                <p className="text-base-content/60 max-w-md">
                                    This category is still warming up. Check back soon — or create
                                    the first course if you’re an admin.
                                </p>
                            </div>
                        ) : (
                            <section
                                className="
                  grid gap-8
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                "
                            >
                                {filteredCourses.map((course) => (
                                    <CourseCard
                                        key={course.courseId}
                                        course={course}
                                        isAdmin={isAdmin}
                                        onEdit={() => setEditingCourse(course)}
                                        onDelete={() => setDeletingCourse(course)}
                                    />
                                ))}

                                {editingCourse && (
                                    <CourseFormModal
                                        open={!!editingCourse}
                                        mode="edit"
                                        initialData={editingCourse ?? undefined}
                                        onClose={() => setEditingCourse(null)}
                                        onSubmit={async (payload) => {
                                            if (!editingCourse) return;

                                            try {
                                                const saved = await updateCourse(
                                                    editingCourse.courseId,
                                                    payload
                                                );

                                                setCourses((prev) =>
                                                    prev.map((c) =>
                                                        c.courseId === saved.courseId ? saved : c
                                                    )
                                                );

                                                toast.success("Course updated successfully");
                                            } catch (err) {
                                                console.error(err);
                                                toast.error("Failed to update course");
                                                throw err; // 👈 keep modal open & stop spinner
                                            } finally {
                                                setEditingCourse(null);
                                            }
                                        }}
                                    />

                                )}
                                {deletingCourse && (
                                    <ConfirmDangerModal
                                        open={!!deletingCourse}
                                        title="Delete course"
                                        description={`Deleting "${deletingCourse.courseName}" will permanently remove:
• all lectures
• all materials
• all assignments
• all student progress

This action cannot be undone.`}
                                        confirmText="Delete course"
                                        onClose={() => setDeletingCourse(null)}
                                        onConfirm={async () => {
                                            if (!deletingCourse) return;

                                            try {
                                                await deleteCourse(deletingCourse.courseId);

                                                // optimistic UI update
                                                setCourses((prev) =>
                                                    prev.filter(
                                                        (c) => c.courseId !== deletingCourse.courseId
                                                    )
                                                );

                                                toast.success("Course deleted successfully");
                                            } catch (err) {
                                                console.error("Failed to delete course", err);
                                                toast.error("Failed to delete course");
                                                throw err; // IMPORTANT: keeps modal open
                                            } finally {
                                                setDeletingCourse(null);
                                            }
                                        }}
                                    />
                                )}

                                {isCreating && (<CourseFormModal
                                    open={isCreating}
                                    mode="create"
                                    onClose={() => setIsCreating(false)}
                                    onSubmit={async (payload) => {
                                        try {
                                            const created = await createCourse(payload);

                                            // add new course to top of list
                                            setCourses((prev) => [created, ...prev]);

                                            toast.success("Course created successfully");
                                        } catch (err) {
                                            console.error("Failed to create course", err);
                                            toast.error("Failed to create course");
                                            throw err; // keeps modal open
                                        } finally {
                                            setIsCreating(false);
                                        }
                                    }}
                                />
                                )}


                                {isAdmin && (
                                    <button
                                        className="
      group card bg-base-100
      border-2 border-dashed border-base-300
      hover:border-primary hover:bg-base-200
      transition-all duration-200
      min-h-[260px]
      flex items-center justify-center
    "
                                        onClick={() => setIsCreating(true)}

                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="text-5xl text-base-content/40 group-hover:text-primary transition">
                                                +
                                            </div>
                                            <span className="text-sm text-base-content/60">
                                                Create new course
                                            </span>
                                        </div>
                                    </button>
                                )}

                            </section>
                        )}
                    </>
                )}

            </main>
        </div>
    );
}
