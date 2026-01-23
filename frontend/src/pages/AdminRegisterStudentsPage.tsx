// src/pages/admin/AdminEnrollmentPage.tsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAllCourses,
  getCourseStudents,
  registerStudentsByEmail,
} from "../services/course.service";
import type { Course, EnrolledStudent } from "../types/course";

export default function AdminEnrollmentPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const [studentEmails, setStudentEmails] = useState<string[]>([""]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);

  const [loading, setLoading] = useState(false);

  /* =========================
     Load Courses
  ========================= */
  useEffect(() => {
    getAllCourses()
      .then(setCourses)
      .catch(() => toast.error("Failed to load courses"));
  }, []);

  /* =========================
     Load Students when Course changes
  ========================= */
  useEffect(() => {
    if (!selectedCourseId) return;

    setStudents([]);
    getCourseStudents(selectedCourseId)
      .then(setStudents)
      .catch(() => toast.error("Failed to load enrolled students"));
  }, [selectedCourseId]);

  useEffect(() => {
    console.log("students updated:", students);
  }, [students]);

  /* =========================
     Register Handler
  ========================= */
  const handleRegister = async () => {
    if (!selectedCourseId) return;

    const emails = studentEmails.map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) {
      toast.error("Please enter at least one email");
      return;
    }

    try {
      setLoading(true);

      const result = await registerStudentsByEmail(selectedCourseId, emails);

      if (result.invalidEmails?.length > 0) {
        toast(`Invalid emails: ${result.invalidEmails.join(", ")}`, {
          icon: "⚠️",
        });
      }

      toast.success(`Added ${result.addedStudentIds.length} student(s)`);

      setStudentEmails([""]);
      setStudents(await getCourseStudents(selectedCourseId));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Render
  ========================= */
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6">
      {/* ================= Course Selector ================= */}
      <div className="card bg-base-100 border shadow-md">
        <div className="card-body">
          <h1 className="card-title text-2xl">Course Enrollment Management</h1>

          <select
            className="select select-bordered max-w-md"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
          >
            <option value="" disabled>
              Select a course
            </option>
            {courses.map((c) => (
              <option key={c.courseId} value={c.courseId}>
                {c.courseName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= Register Students ================= */}
      {selectedCourseId && (
        <div className="card bg-base-100 border shadow-md">
          <div className="card-body space-y-4">
            <h2 className="card-title text-lg">Register Students (by Email)</h2>

            {studentEmails.map((email, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className="input input-bordered flex-1"
                  placeholder={`Student email #${index + 1}`}
                  value={email}
                  onChange={(e) => {
                    const copy = [...studentEmails];
                    copy[index] = e.target.value;
                    setStudentEmails(copy);
                  }}
                />
                <button
                  className="btn btn-outline btn-error"
                  onClick={() =>
                    setStudentEmails(
                      studentEmails.filter((_, i) => i !== index)
                    )
                  }
                >
                  ✕
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setStudentEmails([...studentEmails, ""])}
              >
                + Add Student
              </button>

              <button
                className="btn btn-primary"
                disabled={loading}
                onClick={handleRegister}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Enrolled Students Table ================= */}
      {selectedCourseId && (
        <div className="card bg-base-100 border shadow-md">
          <div className="card-body">
            <h2 className="card-title text-lg">
              Enrolled Students ({students.length})
            </h2>

            <div className="overflow-x-auto mt-4 border rounded-lg">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th className="text-gray-400">User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.userId}>
                      <td>{i + 1}</td>
                      <td>{s.username}</td>
                      <td>{s.email}</td>
                      <td className="text-xs text-gray-400">{s.userId}</td>
                    </tr>
                  ))}

                  {students.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-400">
                        No students enrolled
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
