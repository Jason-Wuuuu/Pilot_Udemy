
export type CourseLevel = "EASY" | "INTERMEDIATE" | "ADVANCED";

export type CourseStatus = "DRAFT" | "CREATED";

export type MaterialType = "VIDEO" | "PDF" | "DOC" | "LINK";

export interface Course {
  courseId: string;
  courseName: string;
  description: string;

  categoryId: string;
  categoryName: string;

  level: CourseLevel;
  status: CourseStatus;

  instructor: string;

  createdBy: string;
  createdAt: string;
  updatedAt: string;

  studentIds: string[];

  // Optional – not always returned
  lectures?: Lecture[];
}

export interface Lecture {
  lectureId: string;
  lectureTitle: string;
  lectureOrder: number;

  // Optional – fetched separately
  materials?: Material[];
}

export interface Material {
  materialId: string;
  materialName: string;

  type: MaterialType;

  // For video/pdf/doc
  url?: string;

  // For display
  size?: number;
  duration?: number;

  createdAt: string;
  updatedAt: string;
}