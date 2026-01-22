import { useState } from "react";
import {
  BookOpen,
  ClipboardList,
  FileText,
  Settings,
  Menu,
  HelpCircle,
  Sun,
  Moon,
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false); // global collapse state
  const [openMenu, setOpenMenu] = useState<string | null>("course"); // track accordion menus
  const [darkMode, setDarkMode] = useState(false); // theme state

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  };

  return (
    <aside
      className={`h-screen bg-base-200 flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-56"
      }`}
    >
      {/* Collapse Toggle Button */}
      <div className="p-2 flex justify-end border-b border-base-300">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Top menu */}
      <ul className="menu p-4 flex-1">
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
            <ul className="pl-6 mt-2">
              <li>
                <a>Course 1</a>
              </li>
              <li>
                <a>Course 2</a>
              </li>
              <li>
                <a>Course 3</a>
              </li>
            </ul>
          )}
        </li>

        {/* Quiz */}
        <li>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => toggleMenu("quiz")}
          >
            <ClipboardList size={18} />
            {!collapsed && <span>Quiz</span>}
          </div>
          {openMenu === "quiz" && !collapsed && (
            <ul className="pl-6 mt-2">
              <li>
                <a>Quiz 1</a>
              </li>
              <li>
                <a>Quiz 2</a>
              </li>
              <li>
                <a>Quiz 3</a>
              </li>
            </ul>
          )}
        </li>

        {/* Homework */}
        <li>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => toggleMenu("homework")}
          >
            <FileText size={18} />
            {!collapsed && <span>Homework</span>}
          </div>
          {openMenu === "homework" && !collapsed && (
            <ul className="pl-6 mt-2">
              <li>
                <a>HW 1</a>
              </li>
              <li>
                <a>HW 2</a>
              </li>
              <li>
                <a>HW 3</a>
              </li>
            </ul>
          )}
        </li>
      </ul>

      {/* Bottom fixed menu */}
      <ul className="menu p-4 border-t border-base-300 space-y-2">
        <li>
          <a className="flex items-center gap-2">
            <HelpCircle size={18} />
            {!collapsed && <span>Help</span>}
          </a>
        </li>
        <li>
          <a className="flex items-center gap-2">
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
          </a>
        </li>

        {/* Dark / Light Mode Toggle */}
        <li>
          <button
            className="flex items-center gap-2 btn btn-ghost w-full"
            onClick={toggleTheme}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
