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
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl h-[85vh] flex flex-col p-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex flex-col gap-4 p-4 sm:p-6 flex-1 min-h-0">
            <div className="flex justify-between items-start">
              <h3 className="text-lg sm:text-xl font-bold">
                {isCreateMode
                  ? "Submit Homework"
                  : userRole === "ADMIN"
                  ? "Grade Submission"
                  : "Your Submission"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="alert alert-error py-2">
                <span className="text-sm">{error}</span>
              </div>
            )}

            {isCreateMode && homeworkTitle && (
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium">Assignment</span>
                </label>
                <p className="text-sm bg-base-200 px-3 py-2 rounded-lg">
                  {homeworkTitle}
                </p>
              </div>
            )}

            {!isCreateMode && userRole === "ADMIN" && (
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium">Student</span>
                </label>
                <p className="text-sm bg-base-200 px-3 py-2 rounded-lg">
                  {submission.studentName || submission.studentId}
                </p>
              </div>
            )}

            {!isCreateMode && (
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium">Submitted At</span>
                </label>
                <p className="text-sm bg-base-200 px-3 py-2 rounded-lg">
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
            )}

            <div className="form-control flex-1 min-h-0 flex flex-col">
              <label htmlFor="text" className="label py-1 shrink-0">
                <span className="label-text font-medium">
                  {isCreateMode ? "Your Answer" : "Submission Content"}
                </span>
              </label>
              {isCreateMode || canStudentEdit ? (
                <textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
                  placeholder={isCreateMode ? "Enter your submission..." : undefined}
                  required
                  className="textarea textarea-bordered text-sm flex-1 resize-none"
                />
              ) : (
                <div className="text-sm bg-base-200 px-3 py-2 rounded-lg whitespace-pre-wrap flex-1 overflow-y-auto">
                  {submission.text}
                </div>
              )}
            </div>

            {!isCreateMode && submission.fileUrl && (
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium">Attached File</span>
                </label>
                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary text-sm"
                >
                  View File
                </a>
              </div>
            )}

            {!isCreateMode && userRole === "ADMIN" && (
              <>
                <div className="form-control">
                  <label htmlFor="score" className="label py-1">
                    <span className="label-text font-medium">Score</span>
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
                    className="input input-bordered input-sm"
                  />
                </div>

                <div className="form-control">
                  <label htmlFor="feedback" className="label py-1">
                    <span className="label-text font-medium">Feedback</span>
                  </label>
                  <textarea
                    id="feedback"
                    value={formData.feedback}
                    onChange={(e) => setFormData((prev) => ({ ...prev, feedback: e.target.value }))}
                    rows={4}
                    placeholder="Enter feedback for the student..."
                    className="textarea textarea-bordered text-sm resize-none"
                  />
                </div>
              </>
            )}

            {!isCreateMode && userRole === "STUDENT" && submission.score !== null && (
              <>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-medium">Score</span>
                  </label>
                  <p className="text-sm bg-base-200 px-3 py-2 rounded-lg">
                    {submission.score}/100
                  </p>
                </div>

                {submission.feedback && (
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-medium">Feedback</span>
                    </label>
                    <div className="text-sm bg-base-200 px-3 py-2 rounded-lg whitespace-pre-wrap">
                      {submission.feedback}
                    </div>
                  </div>
                )}
              </>
            )}

            {!isCreateMode && userRole === "STUDENT" && !canStudentEdit && (
              <div className="alert alert-warning py-2">
                <span className="text-sm">
                  {isGraded 
                    ? "This submission has been graded and can no longer be edited."
                    : "This assignment is past due. You can no longer edit your submission."}
                </span>
              </div>
            )}

            <div className="modal-action mt-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline btn-sm"
              >
                {isCreateMode || userRole === "ADMIN" || canStudentEdit ? "Cancel" : "Close"}
              </button>
              {(isCreateMode || userRole === "ADMIN" || canStudentEdit) && (
                <button
                  type="submit"
                  disabled={loading || (isCreateMode && !formData.text.trim())}
                  className={`btn btn-sm ${isCreateMode ? "btn-success" : "btn-primary"}`}
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
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
