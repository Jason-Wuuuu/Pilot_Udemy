import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import HomeworkDetail from "./components/Homework/HomeworkDetail";
import AppLayout from "./layouts/AppLayout";
import Testing from "./pages/Testing";

function App() {
  return (
    <Routes>
      {/* ------------------ Public Pages ------------------ */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<CreateAccount />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ------------------ Protected Pages ------------------ */}
      <Route element={<ProtectedRoute />}>
        {/* Use a wrapper layout for authenticated pages */}
        <Route path="/" element={<AppLayout />}>
          {/* Nested routes rendered inside AppLayout via <Outlet /> */}
          <Route path="profile" element={<Profile />} />
          <Route path="testing" element={<Testing />} />
          <Route path="homework/:homeworkId" element={<HomeworkDetail />} />
        </Route>
      </Route>

      {/* ------------------ Admin Pages ------------------ */}
      <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
      <Route path="/" element={<AppLayout />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      </Route>
    </Routes>
  );
}

export default App;
