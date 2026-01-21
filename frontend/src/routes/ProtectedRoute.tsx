import { Navigate, Outlet, useLocation } from "react-router";
import { useAppSelector } from "../store/hooks";

const ProtectedRoute = () => {
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  // if not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />; // rerender route
};

export default ProtectedRoute;
