import {
  BookOpen,
  ClipboardList,
  FileText,
  Settings,
  Menu,
  HelpCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getAllCourses } from "../services/course.service";
import type { Course } from "../types/course";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const [openMenu, setOpenMenu] = useState<string | null>("course");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  useEffect(() => {
    setLoadingCourses(true);
    getAllCourses()
      .then(setCourses)
      .finally(() => setLoadingCourses(false));
  }, []);

  return (
    <div className="bg-base-100 flex flex-col h-full border-r border-base-300">
      {/* Collapse toggle */}
      <div className="p-2 flex justify-end border-b border-base-300">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* MAIN MENU */}
      <ul className="menu flex-1 p-4 gap-2">

        <li>
          <Link
            to="/courses"
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              // ensure submenu opens when user lands on courses
              setOpenMenu("course");
            }}
          >
            <BookOpen size={18} />
            {!collapsed && <span>Course</span>}
          </Link>

          {openMenu === "course" && !collapsed && (
            <ul className="pl-6 mt-2 menu-compact space-y-1">
              {loadingCourses && (
                <li className="text-xs text-base-content/50">
                  Loading courses…
                </li>
              )}

              {!loadingCourses && courses.length === 0 && (
                <li className="text-xs text-base-content/50">
                  No courses
                </li>
              )}

              {courses.map((course) => (
                <li key={course.courseId}>
                  <Link
                    to={`/courses/${course.courseId}/dashboard`}
                    className="rounded-lg block px-2 py-1 hover:bg-base-200 transition"
                  >
                    {course.courseName}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>


        <li>
          <Link
            to="/quizzes"
            className="flex items-center gap-2 cursor-pointer"
          >
            <ClipboardList size={18} />
            {!collapsed && <span>Quiz</span>}
          </Link>
        </li>


        <li>
          <Link
            to="/homeworks"
            className="flex items-center gap-2 cursor-pointer"
          >
            <FileText size={18} />
            {!collapsed && <span>Homework</span>}
          </Link>
        </li>
      </ul>

      {/* BOTTOM MENU */}
      <ul className="menu p-4 border-t border-base-300 space-y-2">
        <li>
          <Link to="/help" className="flex items-center gap-2 rounded-lg cursor-pointer">
            <HelpCircle size={18} />
            {!collapsed && <span>Help</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/setting"
            className="flex items-center gap-2 rounded-lg"
          >
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
