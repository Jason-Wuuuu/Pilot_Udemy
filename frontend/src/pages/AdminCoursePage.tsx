import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import type { RootState } from "../store";
import { getAllCourses } from "../services/course.service";

import type { Course } from "../types/course";

export default function AdminCoursesPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllCourses();
        setCourses(data);
      } catch {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="text-sm text-gray-500 mt-1">Manage courses and quizzes</p>
      </div>

      {/* Table */}
      {courses.length === 0 ? (
        <div className="alert alert-info">No courses found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Course</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {courses.map((course) => (
                <tr key={course.courseId}>
                  <td>
                    <div className="font-medium">{course.courseName}</div>
                    {course.description && (
                      <div className="text-sm text-gray-500">
                        {course.description}
                      </div>
                    )}
                  </td>

                  <td className="text-sm text-gray-500">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>

                  <td className="text-right">
                    <Link
                      to={`/admin/courses/${course.courseId}/quizzes`}
                      className="btn btn-sm btn-outline"
                    >
                      Manage Quizzes
                    </Link>
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
