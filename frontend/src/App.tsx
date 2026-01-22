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
import QuizListPage from "./pages/QuizListPage";
import QuizTakePage from "./pages/QuizTakePage";
import QuizResultPage from "./pages/QuizResultPage";
import QuizCreatePage from "./pages/QuizCreatePage";
import AdminCourseQuizListPage from "./pages/AdminCourseQuizListPage";
import AdminQuizPreviewPage from "./pages/AdminQuizPreviewPage";
import QuizEditPage from "./pages/QuizEditPage";
import AdminSubmissionListPage from "./pages/AdminSubmissionListPage";

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

          {/* Quiz */}
          <Route path="/quizzes" element={<QuizListPage />} />

          <Route path="/quizzes/:quizId" element={<QuizTakePage />} />

          {/* Submission / Result */}
          <Route
            path="/submissions/:submissionId"
            element={<QuizResultPage />}
          />
        </Route>

        {/* Role-protected pages */}
        <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
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
      </Routes>
    </div>
  );
}

export default App;
