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
  title: string;
  lectureOrder: number;
  description?: string;
  // Optional – fetched separately
  materials?: Material[];
}

export interface Material {
  materialId: string;
  title: string;
  materialType: "PDF" | "VIDEO" | "SLIDE" | "TEXT";
  mimeType?: string;
  downloadUrl?: string;
  materialOrder: number;
  isPreview: boolean;
}
