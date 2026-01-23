import { Link } from "react-router";
import { useAppSelector } from "../store/hooks";
import { useTheme } from "../utils/ThemeContext";
import { Moon, Sun } from "lucide-react";

const NavBar = () => {
  const user = useAppSelector((state) => state.auth.user);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="navbar bg-base-100 border-b sticky top-0 z-50 px-6">
      {/* Left: website name */}
      <div className="navbar-start">
        <span
          onClick={() => (window.location.href = "/")}
          className="text-xl font-bold cursor-pointer"
        >
          Udemy-copy
        </span>
      </div>

      {/* Admin: Register Students */}
      {user?.role === "ADMIN" && (
        <Link to="/admin/register" className="btn btn-outline btn-sm">
          Register Students
        </Link>
      )}

      {/* Right: theme + user */}
      <div className="navbar-end space-x-2">
        {/* Theme toggle */}
        <button
          className="btn btn-ghost btn-sm p-1"
          onClick={toggleTheme}
          title="Toggle light/dark mode"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User login */}
        {user ? (
          <Link to="/profile" className="btn btn-primary btn-sm">
            welcome {user.username}!
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default NavBar;
