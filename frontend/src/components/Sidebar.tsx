import {
  BookOpen,
  ClipboardList,
  FileText,
  Settings,
  Menu,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const [openMenu, setOpenMenu] = useState<string | null>("course");

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="bg-base-100 flex flex-col h-full border-r border-base-300">
      {/* Collapse toggle */}
      <div className="p-2 flex justify-end border-b border-base-300">
        <button
          className="btn btn-ghost btn-sm flex items-center gap-2"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Menu */}
      <ul className="menu flex-1 p-4 gap-2">
        {/* Course */}
        <li>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => toggleMenu("course")}
          >
            <BookOpen size={18} />
            {!collapsed && <span>Course</span>}
          </div>
          {openMenu === "course" && !collapsed && (
            <ul className="pl-6 mt-2 menu-compact">
              <li>
                <a className="rounded-lg">Course 1</a>
              </li>
              <li>
                <a className="rounded-lg">Course 2</a>
              </li>
              <li>
                <a className="rounded-lg">Course 3</a>
              </li>
            </ul>
          )}
        </li>

        {/* Quiz */}
        <li>
          <Link
            to="/quizzes"
            className="flex items-center gap-2 cursor-pointer"
          >
            <ClipboardList size={18} />
            {!collapsed && <span>Quiz</span>}
          </Link>
          {/* {openMenu === "quiz" && !collapsed && (
            <ul className="pl-6 mt-2 menu-compact">
            </ul>
          )} */}
        </li>

        {/* Homework */}
        <li>
          <Link 
            to="/homeworks"
            className="flex items-center gap-2 cursor-pointer"
          >
            <FileText size={18} />
            {!collapsed && <span>Homework</span>}
          </Link>
          {/* {openMenu === "homework" && !collapsed && (
            <ul className="pl-6 mt-2 menu-compact">
              <li>
                <a className="rounded-lg">HW 1</a>
              </li>
              <li>
                <a className="rounded-lg">HW 2</a>
              </li>
              <li>
                <a className="rounded-lg">HW 3</a>
              </li>
            </ul>
          )} */}
        </li>
      </ul>

      {/* Bottom menu */}
      <ul className="menu p-4 border-t border-base-300 space-y-2">
        <li>
          <a className="flex items-center gap-2 rounded-lg">
            <HelpCircle size={18} /> {!collapsed && <span>Help</span>}
          </a>
        </li>
        <li>
          <Link to="/setting" className="flex items-center gap-2 rounded-lg">
            <Settings size={18} /> {!collapsed && <span>Settings</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
