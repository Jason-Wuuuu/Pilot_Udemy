import { Link } from "react-router";
import { useAppSelector } from "../store/hooks";

const NavBar = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div>
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        {/* when you click the website name Udemy-copy, it will refresh the website */}
        <span
          onClick={() => (window.location.href = "/")}
          className="text-xl font-bold cursor-pointer"
        >
          Udemy-copy
        </span>

        {user ? (
          <Link to="/profile" className="btn btn-primary btn-sm">
            welcome {user.username}!
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Login
          </Link>
        )}
      </header>

      {/* Sub Navigation Bar */}
      <nav className="px-6 py-3 border-b flex gap-6">
        <Link to="/course" className="font-medium">
          Course
        </Link>
        <Link to="/homework" className="font-medium">
          Homework
        </Link>
        <Link to="/quiz" className="font-medium">
          Quiz
        </Link>
      </nav>
    </div>
  );
};

export default NavBar;
