import { useState, useEffect } from "react";
import { useAppSelector } from "../../store/hooks";
import type { Submission } from "../../types/homework";

interface SubmissionModalProps {
  submission?: Submission;
  homeworkId?: string;
  homeworkTitle?: string;
  isOverdue: boolean;
  onClose: () => void;
  onSave: (submission: Submission) => void;
}

export default function SubmissionModal({
  submission,
  homeworkId,
  homeworkTitle,
  isOverdue,
  onClose,
  onSave,
}: SubmissionModalProps) {
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id;
  const userRole = user?.role;

  const isCreateMode = !submission;
  const isGraded = submission?.score !== null && submission?.score !== undefined;
  
  const [formData, setFormData] = useState({
    text: submission?.text || "",
    score: submission?.score ?? null,
    feedback: submission?.feedback || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canStudentEdit = userRole === "STUDENT" && !isOverdue && !isGraded;

  useEffect(() => {
    if (submission) {
      setFormData({
        text: submission.text,
        score: submission.score,
        feedback: submission.feedback || "",
      });
    }
  }, [submission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let url: string;
      let method: string;
      let body: object;

      if (isCreateMode) {
        // Create new submission
        url = `http://localhost:3000/api/homeworks/${homeworkId}/submissions`;
        method = "POST";
        body = {
          studentId: userId,
          studentName: user?.username,
          text: formData.text,
        };
      } else if (userRole === "ADMIN") {
        // Admin grading
        url = `http://localhost:3000/api/homework-submissions/${submission.id}/grade`;
        method = "PUT";
        body = {
          score: formData.score,
          feedback: formData.feedback,
        };
      } else {
        // Student editing
        url = `http://localhost:3000/api/homework-submissions/${submission.id}/content`;
        method = "PUT";
        body = {
          studentId: submission.studentId,
          studentName: user?.username,
          text: formData.text,
        };
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      onSave(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[85vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex flex-col gap-4 p-4 sm:p-6 flex-1 min-h-0">
            <div className="flex justify-between items-start">
              <h2 className="text-lg sm:text-xl font-bold">
                {isCreateMode
                  ? "Submit Homework"
                  : userRole === "ADMIN"
                  ? "Grade Submission"
                  : "Your Submission"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {isCreateMode && homeworkTitle && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Assignment</label>
                <p className="text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                  {homeworkTitle}
                </p>
              </div>
            )}

            {!isCreateMode && userRole === "ADMIN" && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Student</label>
                <p className="text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                  {submission.studentName || submission.studentId}
                </p>
              </div>
            )}

            {!isCreateMode && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Submitted At</label>
                <p className="text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1 flex-1 min-h-0">
              <label htmlFor="text" className="text-sm font-medium text-gray-700 shrink-0">
                {isCreateMode ? "Your Answer" : "Submission Content"}
              </label>
              {isCreateMode || canStudentEdit ? (
                <textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
                  placeholder={isCreateMode ? "Enter your submission..." : undefined}
                  required
                  className="text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none flex-1"
                />
              ) : (
                <div className="text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded border border-gray-200 whitespace-pre-wrap flex-1 overflow-y-auto">
                  {submission.text}
                </div>
              )}
            </div>

            {!isCreateMode && submission.fileUrl && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Attached File</label>
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:text-blue-700 underline"
                >
                  View File
                </a>
              </div>
            )}

            {!isCreateMode && userRole === "ADMIN" && (
              <>
                <div className="flex flex-col gap-1">
                  <label htmlFor="score" className="text-sm font-medium text-gray-700">
                    Score
                  </label>
                  <input
                    type="number"
                    id="score"
                    min={0}
                    max={100}
                    value={formData.score ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        score: e.target.value === "" ? null : Number(e.target.value),
                      }))
                    }
                    placeholder="Enter score (0-100)"
                    className="text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="feedback" className="text-sm font-medium text-gray-700">
                    Feedback
                  </label>
                  <textarea
                    id="feedback"
                    value={formData.feedback}
                    onChange={(e) => setFormData((prev) => ({ ...prev, feedback: e.target.value }))}
                    rows={4}
                    placeholder="Enter feedback for the student..."
                    className="text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </>
            )}

            {!isCreateMode && userRole === "STUDENT" && submission.score !== null && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Score</label>
                  <p className="text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                    {submission.score}/100
                  </p>
                </div>

                {submission.feedback && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Feedback</label>
                    <div className="text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded border border-gray-200 whitespace-pre-wrap">
                      {submission.feedback}
                    </div>
                  </div>
                )}
              </>
            )}

            {!isCreateMode && userRole === "STUDENT" && !canStudentEdit && (
              <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded shrink-0">
                {isGraded 
                  ? "This submission has been graded and can no longer be edited."
                  : "This assignment is past due. You can no longer edit your submission."}
              </p>
            )}

            <div className="flex justify-end gap-2 sm:gap-3 mt-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                {isCreateMode || userRole === "ADMIN" || canStudentEdit ? "Cancel" : "Close"}
              </button>
              {(isCreateMode || userRole === "ADMIN" || canStudentEdit) && (
                <button
                  type="submit"
                  disabled={loading || (isCreateMode && !formData.text.trim())}
                  className={`text-sm px-4 py-2 rounded text-white ${
                    loading || (isCreateMode && !formData.text.trim())
                      ? isCreateMode ? "bg-green-300 cursor-not-allowed" : "bg-blue-300 cursor-not-allowed"
                      : isCreateMode ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {loading 
                    ? (isCreateMode ? "Submitting..." : "Saving...") 
                    : (isCreateMode ? "Submit" : "Save")}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
