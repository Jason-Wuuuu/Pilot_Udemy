import axios from "axios";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// 自动在请求头加 Authorization + userId
api.interceptors.request.use((config) => {
  const auth = localStorage.getItem("auth");
  if (auth) {
    const { token } = JSON.parse(auth); //user
    if (token) config.headers.Authorization = `Bearer ${token}`;
    // if (user) {
    //   config.params = { ...(config.params || {}), userId: user.id };
    // }
  }
  return config;
});

// 自动处理 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = "/login"; // 强制跳回 login
    }
    return Promise.reject(err);
  }
);

export default api;
