import api from "../api/axios";
import type { Course, Lecture, Material } from "../types/course";

/* ======================
   COURSE
====================== */

// GET /courses
export const getAllCourses = async():Promise<Course[]>=>{
  const res = await api.get(`/courses`);
  return res.data.data;
}

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
  payload: Partial<Course>,
): Promise<Course> => {
  const res = await api.post("/courses", payload);
  return res.data.data;
};

// PUT /courses/:courseId (ADMIN)
export const updateCourse = async (
  courseId: string,
  payload: Partial<Course>,
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
  courseId: string,
): Promise<Lecture[]> => {
  const res = await api.get(`/courses/${courseId}/lectures`);
  return res.data.data;
};

// POST /courses/:courseId/lectures (ADMIN)
export const createLecture = async (
  courseId: string,
  payload: Partial<Lecture>,
): Promise<Lecture> => {
  const res = await api.post(`/courses/${courseId}/lectures`, payload);
  return res.data.data;
};

// PUT /courses/:courseId/lectures/:lectureId (ADMIN)
export const updateLecture = async (
  courseId: string,
  lectureId: string,
  payload: Partial<Lecture>,
): Promise<Lecture> => {
  const res = await api.put(
    `/courses/${courseId}/lectures/${lectureId}`,
    payload,
  );
  return res.data.data;
};

// DELETE /courses/:courseId/lectures/:lectureId (ADMIN)
export const deleteLecture = async (
  courseId: string,
  lectureId: string,
): Promise<void> => {
  await api.delete(`/courses/${courseId}/lectures/${lectureId}`);
};

/* ======================
   MATERIALS
====================== */

// GET /courses/:courseId/lectures/:lectureId/materials
export const getMaterialsByLectureId = async (
  courseId: string,
  lectureId: string,
): Promise<Material[]> => {
  const res = await api.get(
    `/courses/${courseId}/lectures/${lectureId}/materials`,
  );
  return res.data.data;
};

// POST /courses/:courseId/lectures/:lectureId/materials (ADMIN)
export const createMaterial = async (
  courseId: string,
  lectureId: string,
  formData: FormData,
): Promise<Material> => {
  const res = await api.post(
    `/courses/${courseId}/lectures/${lectureId}/materials`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data.data;
};

// PUT /courses/:courseId/lectures/:lectureId/materials/:materialId (ADMIN)
export const updateMaterial = async (
  courseId: string,
  lectureId: string,
  materialId: string,
  formData: FormData,
): Promise<Material> => {
  const res = await api.put(
    `/courses/${courseId}/lectures/${lectureId}/materials/${materialId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data.data;
};

// DELETE /courses/:courseId/lectures/:lectureId/materials/:materialId (ADMIN)
export const deleteMaterial = async (
  courseId: string,
  lectureId: string,
  materialId: string,
): Promise<void> => {
  await api.delete(
    `/courses/${courseId}/lectures/${lectureId}/materials/${materialId}`,
  );
};
