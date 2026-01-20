import { Link,Navigate, useNavigate, useLocation } from "react-router";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice";
import type { AppDispatch } from "../store";
import { normalizeUser } from "../utils/normalizeUser";
import api from "../api/axios"; // 使用统一 axios
import { useAppSelector } from "../store/hooks";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  // if user is redirected, send back to the previous page, else goes to profile
  const from = location.state?.from?.pathname || "/profile";

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { user, token } = res.data;
      // 保存到 Redux + localStorage
      dispatch(loginSuccess({ user: normalizeUser(user), token }));

      // 登录成功后跳回来源页面
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      // 可用 react-hot-toast 替代 alert
      alert(err.response?.data?.message || "Login failed");
    }
  };

  // protect login page for already logged-in users
  const user = useAppSelector((state) => state.auth.user);

  if (user) {
    // Already logged in → redirect to homepage
    return <Navigate to="/" replace />;
  }


  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm p-6 border rounded space-y-6">
        <h1 className="text-2xl font-bold text-center">Login</h1>

        {/* Email */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            placeholder="email@example.com"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Links under password */}
          <div className="flex justify-between mt-2 text-sm">
            <Link to="/forgot-password" className="link link-hover">
              forget password
            </Link>

            <Link to="/register" className="link link-hover">
              create an account
            </Link>
          </div>
        </div>

        {/* Login Button */}
        <button onClick={handleLogin} className="btn btn-primary w-full">
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
