import type { Course } from "../../types/course";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../store/hooks";
import cover1 from "../../assets/course-covers/cover-1.jpg";
import cover2 from "../../assets/course-covers/cover-2.jpg";
import cover3 from "../../assets/course-covers/cover-3.jpg";
import cover4 from "../../assets/course-covers/cover-4.jpg";
import cover6 from "../../assets/course-covers/cover-6.jpg";
import cover7 from "../../assets/course-covers/cover-7.jpg";
import cover8 from "../../assets/course-covers/cover-8.jpg";
import cover9 from "../../assets/course-covers/cover-9.jpg";
import cover10 from "../../assets/course-covers/cover-10.jpg";

const COURSE_COVERS = [
  cover1,
  cover2,
  cover3,
  cover4,
  cover6,
  cover7,
  cover8,
  cover9,
  cover10,
];
import { toast } from "react-hot-toast";

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
function getCoverForCourse(courseId: string) {
  let hash = 0;
  for (let i = 0; i < courseId.length; i++) {
    hash = (hash + courseId.charCodeAt(i)) % COURSE_COVERS.length;
  }
  return COURSE_COVERS[hash];
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

  const isEnrolled =
    !!user && user.role === "STUDENT" && course.studentIds?.includes(user.id);

  // const handleViewCourse = () => {
  //   if (isAuthenticated) {
  //     navigate(`/courses/${course.courseId}/dashboard`);
  //   } else {
  //     navigate(`/courses/${course.courseId}`);
  //   }
  // };

  //If admin then go to course edit page, if student check enrolled or not if not enrolled then prevent redirecting detail, if enrolled then go to the detail page
  const handleViewCourse = () => {
    if (!user) {
      navigate(`/courses/${course.courseId}`);
      return;
    }

    if (user.role === "ADMIN") {
      navigate(`/courses/${course.courseId}/dashboard`);
      return;
    }

    if (isEnrolled) {
      navigate(`/courses/${course.courseId}/dashboard`);
    } else {
      toast.error("You are not enrolled in this course");
      return;
    }
  };
  const coverImage = getCoverForCourse(course.courseId);
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
        className="relative h-32 overflow-hidden">
        <img
          src={coverImage}
          alt={course.courseName}
          className="w-full h-full object-cover"
        />
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
          Instructor: <span className="font-medium">{course.instructor}</span>
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
