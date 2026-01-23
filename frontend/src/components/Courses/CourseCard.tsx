import type { Course } from "../../types/course";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../store/hooks";

interface CourseCardProps {
  course: Course;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getLevelBadgeStyle(level: string) {
  switch (level.toLowerCase()) {
    case "easy":
      return "bg-white/90 text-primary border border-white/60";
    case "intermediate":
      return "bg-white/90 text-warning border border-white/60";
    case "advanced":
      return "bg-white/90 text-error border border-white/60";
    default:
      return "bg-white/90 text-base-content border border-white/60";
  }
}

export default function CourseCard({
  course,
  isAdmin,
  onEdit,
  onDelete,
}: CourseCardProps) {
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated =
    user && (user.role === "STUDENT" || user.role === "ADMIN");

  const handleViewCourse = () => {
    if (isAuthenticated) {
      navigate(`/courses/${course.courseId}/dashboard`);
    } else {
      navigate(`/courses/${course.courseId}`);
    }
  };

  return (
    <div
      className="
        card relative bg-base-100 shadow-lg
        hover:shadow-xl hover:-translate-y-1
        transition-all duration-300
      "
    >
      {/* ADMIN MENU */}
      {isAdmin && (
        <div className="absolute top-3 right-3 z-10">
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="
                btn btn-ghost btn-xs
                text-white
                bg-white/20
                hover:bg-white/30
                backdrop-blur
                rounded-xl
              "
            >
              ⋮
            </label>

            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32"
            >
              <li>
                <button onClick={onEdit}>Edit</button>
              </li>
              <li>
                <button className="text-error" onClick={onDelete}>
                  Delete
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Color Header */}
      <figure
        className="
          relative h-32
          bg-gradient-to-br
          from-purple-500
          via-indigo-500
          to-blue-500
        "
      >
        <div className="absolute top-3 left-3">
          <span
            className={`
              px-3 py-1 rounded-full text-xs font-semibold tracking-wide
              ${getLevelBadgeStyle(course.level)}
            `}
          >
            {course.level.toUpperCase()}
          </span>
        </div>
      </figure>

      {/* Body */}
      <div className="card-body px-6 py-5">
        <h3 className="text-2xl font-bold leading-snug line-clamp-2">
          {course.courseName}
        </h3>

        <p className="text-base text-base-content/70 line-clamp-2 mt-1">
          {course.description}
        </p>

        <div className="mt-3 text-sm text-base-content/60">
          Instructor:{" "}
          <span className="font-medium">{course.instructor}</span>
        </div>

        <div className="mt-5">
          <button
            onClick={handleViewCourse}
            className="btn btn-primary btn-sm rounded-full px-5"
          >
            View course
          </button>
        </div>
      </div>
    </div>
  );
}
