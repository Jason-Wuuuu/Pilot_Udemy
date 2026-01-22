import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { RootState, AppDispatch } from "../store";
import { logout } from "../store/slices/authSlice";
import DeleteAccountButton  from "../components/DeleteAccountButton";
import BackToHomepage from "../components/BackToHomepage";

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);

  // 理论上 Profile 已经被 ProtectedRoute 包了
  // 但多一层保险是好习惯
  useEffect(() => {
    if (user === null) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);
  console.log("profile",user);
  if (!user) return null;
 

  const handleLogout = () => {
    dispatch(logout()); // 清 redux + localStorage
    navigate("/", { replace: true }); // 回到首页
  };

  return (
    <div className="flex justify-center items-center h-full w-full">
      {/* <BackToHomepage /> */}
      <div className="w-full max-w-md p-6 border rounded space-y-6">
        <h1 className="text-2xl font-bold text-center">Profile</h1>

        {/* Avatar */}
        {user.profileImage && (
          <div className="flex justify-center">
            <img
              src={user.profileImage}
              alt="avatar"
              className="w-24 h-24 rounded-full"
            />
          </div>
        )}

        {/* User Info */}
        <div className="space-y-2">
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="btn btn-error w-full">
          Logout
        </button>
        {/* Delete Account button with extra styling */}
        <DeleteAccountButton
          userId={user.id}
          className="btn btn-outline btn-error w-full mt-2"
        />
      </div>
    </div>
  );
};

export default Profile;
