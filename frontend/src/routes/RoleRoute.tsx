import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "../store/hooks";

interface Props {
  allowedRoles: Array<"ADMIN" | "STUDENT">;
}

const RoleRoute = ({ allowedRoles }: Props) => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return <Navigate to="/login" replace />; // 未登录
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />; // 没权限

  return <Outlet />;
};

export default RoleRoute;
