import api from "../api/axios";
import type {
  Course,
  Lecture,
  Material,
  EnrollmentResult,
  EnrolledStudent,
} from "../types/course";
import { API_PATHS } from "../utils/apiPath";

/* ======================
   COURSE
====================== */

// GET /courses
export const getAllCourses = async (): Promise<Course[]> => {
  const res = await api.get(`/courses`);
  return res.data.data;
};

// GET /courses/categories/:categoryId
export const getCoursesByCategory = async (
  categoryId: string
): Promise<Course[]> => {
  const res = await api.get(`/courses/categories/${categoryId}`);
  return res.data.data;
};

// GET /courses/:courseId
export const getCourseById = async (courseId: string): Promise<Course> => {
  const res = await api.get(`/courses/${courseId}`);
  return res.data.data;
};

// POST /courses (ADMIN)
export const createCourse = async (
  payload: Partial<Course>
): Promise<Course> => {
  const res = await api.post("/courses", payload);
  return res.data.data;
};

// PUT /courses/:courseId (ADMIN)
export const updateCourse = async (
  courseId: string,
  payload: Partial<Course>
): Promise<Course> => {
  const res = await api.put(`/courses/${courseId}`, payload);
  return res.data.data;
};

// DELETE /courses/:courseId (ADMIN)
export const deleteCourse = async (courseId: string): Promise<void> => {
  await api.delete(`/courses/${courseId}`);
};

/* ======================
   LECTURES
====================== */

// GET /courses/:courseId/lectures
export const getLecturesByCourseId = async (
  courseId: string
): Promise<Lecture[]> => {
  const res = await api.get(`/courses/${courseId}/lectures`);
  return res.data.data;
};

// POST /courses/:courseId/lectures (ADMIN)
export const createLecture = async (
  courseId: string,
  payload: Partial<Lecture>
): Promise<Lecture> => {
  const res = await api.post(`/courses/${courseId}/lectures`, payload);
  return res.data.data;
};

// PUT /courses/:courseId/lectures/:lectureId (ADMIN)
export const updateLecture = async (
  courseId: string,
  lectureId: string,
  payload: Partial<Lecture>
): Promise<Lecture> => {
  const res = await api.put(
    `/courses/${courseId}/lectures/${lectureId}`,
    payload
  );
  return res.data.data;
};

// DELETE /courses/:courseId/lectures/:lectureId (ADMIN)
export const deleteLecture = async (
  courseId: string,
  lectureId: string
): Promise<void> => {
  await api.delete(`/courses/${courseId}/lectures/${lectureId}`);
};

/* ======================
   MATERIALS
====================== */

// GET /courses/:courseId/lectures/:lectureId/materials
export const getMaterialsByLectureId = async (
  courseId: string,
  lectureId: string
): Promise<Material[]> => {
  const res = await api.get(
    `/courses/${courseId}/lectures/${lectureId}/materials`
  );
  return res.data.data;
};

// POST /courses/:courseId/lectures/:lectureId/materials (ADMIN)
export const createMaterial = async (
  courseId: string,
  lectureId: string,
  formData: FormData
): Promise<Material> => {
  const res = await api.post(
    `/courses/${courseId}/lectures/${lectureId}/materials`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data.data;
};

// PUT /courses/:courseId/lectures/:lectureId/materials/:materialId (ADMIN)
export const updateMaterial = async (
  courseId: string,
  lectureId: string,
  materialId: string,
  formData: FormData
): Promise<Material> => {
  const res = await api.put(
    `/courses/${courseId}/lectures/${lectureId}/materials/${materialId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data.data;
};

// DELETE /courses/:courseId/lectures/:lectureId/materials/:materialId (ADMIN)
export const deleteMaterial = async (
  courseId: string,
  lectureId: string,
  materialId: string
): Promise<void> => {
  await api.delete(
    `/courses/${courseId}/lectures/${lectureId}/materials/${materialId}`
  );
};

//Register Students
export async function registerStudents(
  courseId: string,
  studentIds: string[]
): Promise<EnrollmentResult> {
  const res = await api.post(`/courses/${courseId}/students`, { studentIds });
  return res.data.data;
}

//Register Students by email
export async function registerStudentsByEmail(
  courseId: string,
  emails: string[]
) {
  const res = await api.post(`/courses/${courseId}/students/by-email`, {
    emails,
  });
  return res.data.data;
}

//Get Course Students
// services/course.service.ts
export async function getCourseStudents(
  courseId: string
): Promise<EnrolledStudent[]> {
  const res = await api.get(`/courses/${courseId}/students`);

  // 永远兜底成数组
  return res.data?.data?.students ?? [];
}

//AI generate Summary for materials
export async function aiGenerateSummaryPreview(payload: {
  downloadUrl: string;
  mimeType?: string;
}) {
  const res = await api.post("/ai/summary", payload);
  return res.data;
}
