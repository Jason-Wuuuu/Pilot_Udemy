import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import CourseListPage from './pages/CourseListPage';
import CourseDetailPage from "./pages/CourseDetailPage";
import HomeworkDetail from "./components/Homework/HomeworkDetail";
import StartLearningPage from './pages/StartLearningPage'
import { Toaster } from "react-hot-toast";


function App() {
  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      <Routes>
        {/* public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CreateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>

        <Route
          path="/categories/:categoryId"
          element={<CourseListPage />}
        />
        <Route
          path="/courses/:courseId"
          element={<CourseDetailPage />}
        />

        {/* Auth-protected pages */}
        <Route element={<ProtectedRoute />}>

          {/* <Route path="/quiz" element={<QuizPage />} />
          <Route path="/homework" element={<HomeworkPage />} /> */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/homework/:homeworkId" element={<HomeworkDetail />} />
          <Route
            path="/learn/courses/:courseId"
            element={
              <StartLearningPage />
            }
          />
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
