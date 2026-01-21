import { Routes, Route, Navigate } from "react-router-dom";
import QuizListPage from "./pages/QuizListPage";
import QuizTakePage from "./pages/QuizTakePage";
import QuizResultPage from "./pages/QuizResultPage";
import QuizCreatePage from "./pages/QuizCreatePage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/quizzes" />} />

        <Route path="/quizzes" element={<QuizListPage />} />
        <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
        <Route path="/submissions/:submissionId" element={<QuizResultPage />} />

        {/* Admin / Author side */}
        <Route path="/quizzes/new" element={<QuizCreatePage />} />
      </Routes>
    </>
  );
}

export default App;
