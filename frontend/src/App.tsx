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

function App() {
  return (
    <div>
      <Routes>
        {/* public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CreateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>

        {/* Auth-protected pages */}
        <Route element={<ProtectedRoute />}>
          {/* <Route path="/course" element={<CoursePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/homework" element={<HomeworkPage />} /> */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/homework/:homeworkId" element={<HomeworkDetail />} />
        </Route>

        {/* Role-protected pages */}
        <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
