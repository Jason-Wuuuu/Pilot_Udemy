import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import CourseListPage from "./pages/CourseListPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CourseDashboardPage from "./pages/CourseDashboardPage";
import HomeworkDetail from "./components/Homework/HomeworkDetail";
import StartLearningPage from "./pages/StartLearningPage";
import { Toaster } from "react-hot-toast";
import Homework from "./components/Homework";

import QuizListPage from "./pages/QuizListPage";
import QuizTakePage from "./pages/QuizTakePage";
import QuizResultPage from "./pages/QuizResultPage";
import QuizCreatePage from "./pages/QuizCreatePage";
import AdminCourseQuizListPage from "./pages/AdminCourseQuizListPage";
import AdminQuizPreviewPage from "./pages/AdminQuizPreviewPage";
import QuizEditPage from "./pages/QuizEditPage";
import AdminSubmissionListPage from "./pages/AdminSubmissionListPage";
import AppLayout from "./layouts/AppLayout";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      <Routes>
        {/* ------------------ Public Pages ------------------ */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CreateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/courses" element={<CourseListPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />

        {/* Auth-protected pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            {/* <Route path="/quiz" element={<QuizPage />} />
          <Route path="/homework" element={<HomeworkPage />} /> */}
            <Route path="profile" element={<Profile />} />
            {/* Course */}
            <Route
              path="learn/courses/:courseId"
              element={<StartLearningPage />}
            />
            <Route
              path="courses/:courseId/dashboard"
              element={<CourseDashboardPage />}
            />
            <Route path="homeworks/:lectureId" element={<Homework />} />
            <Route path="homeworks" element={<Homework />} />
            <Route path="homework/:homeworkId" element={<HomeworkDetail />} />

            {/* Quiz */}
            <Route path="quizzes" element={<QuizListPage />} />

            <Route path="quizzes/:quizId" element={<QuizTakePage />} />

            {/* Submission / Result */}
            <Route
              path="submissions/:submissionId"
              element={<QuizResultPage />}
            />
          </Route>
        </Route>

        {/* ------------------ Admin Pages ------------------ */}
        <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/" element={<AppLayout />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route
              path="/admin/courses/:courseId/quizzes/create"
              element={<QuizCreatePage />}
            />
            <Route
              path="/admin/courses/:courseId/quizzes"
              element={<AdminCourseQuizListPage />}
            />
            <Route
              path="/admin/courses/:courseId/quizzes/:quizId/preview"
              element={<AdminQuizPreviewPage />}
            />
            <Route
              path="/admin/courses/:courseId/quizzes/:quizId/edit"
              element={<QuizEditPage />}
            />
            <Route
              path="/admin/courses/:courseId/quizzes/:quizId/submissions"
              element={<AdminSubmissionListPage />}
            />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
