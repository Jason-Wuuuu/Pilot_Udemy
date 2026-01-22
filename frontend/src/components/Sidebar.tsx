import { BookOpen, ClipboardList, FileText, Settings } from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="h-screen w-56 bg-base-200 flex flex-col">
      {/* Top menu */}
      <ul className="menu p-4 flex-1">
        {/* Course */}
        <li>
          <details open>
            <summary className="flex items-center gap-2">
              <BookOpen size={18} />
              Course
            </summary>
            <ul>
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
          </details>
        </li>

        {/* Quiz */}
        <li>
          <details>
            <summary className="flex items-center gap-2">
              <ClipboardList size={18} />
              Quiz
            </summary>
            <ul>
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
          </details>
        </li>

        {/* Homework */}
        <li>
          <details>
            <summary className="flex items-center gap-2">
              <FileText size={18} />
              Homework
            </summary>
            <ul>
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
          </details>
        </li>
      </ul>

      {/* Bottom fixed menu */}
      <ul className="menu p-4 border-t border-base-300">
        <li>
          <a className="flex items-center gap-2">
            <FileText size={18} />
            Homework
          </a>
        </li>
        <li>
          <a className="flex items-center gap-2">
            <Settings size={18} />
            Settings
          </a>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
