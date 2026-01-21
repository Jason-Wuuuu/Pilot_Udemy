import type { Course } from "../types/course";
import { Link } from "react-router";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition bg-white">
      {/* Image placeholder */}
      <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400">
        Course Image
      </div>

      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold mb-1 line-clamp-2">
          {course.courseName}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {course.description}
        </p>

        {/* Meta */}
        <div className="mt-3 text-sm text-gray-500">
          <span className="mr-4">Level: {course.level}</span>
          <span>Instructor: {course.instructor}</span>
        </div>

        {/* CTA */}
        <div className="mt-4">
          <Link
            to={`/courses/${course.courseId}`}
            className="text-blue-600 hover:underline font-medium"
          >
            View course
          </Link>
        </div>

        {/* =====================
            ADMIN ONLY (later)
           ===================== */}
        {/*
        <div className="mt-4 flex gap-2">
          <button>Edit</button>
          <button>Delete</button>
        </div>
        */}
      </div>
    </div>
  );
}
