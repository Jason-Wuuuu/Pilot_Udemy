import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useHomework } from "../../hooks/useHomework";
import { useSubmissions } from "../../hooks/useSubmissions";
import { useMySubmission } from "../../hooks/useMySubmission";
import { useAppSelector } from "../../store/hooks";
import { getTimeRemaining } from "../../utils/time";
import type { Submission } from "../../types/homework";
import HomeworkForm from "./HomeworkForm";
import SubmissionsTable from "../HomeworkSubmission/SubmissionsTable";

export default function HomeworkDetail() {
  const { homeworkId } = useParams<{ homeworkId: string }>();
  const navigate = useNavigate();
  const gradingPanelRef = useRef<HTMLDivElement>(null);

  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id;
  const userRole = user?.role;

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState<number | null>(null);
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [gradingSaving, setGradingSaving] = useState(false);
  const [gradingError, setGradingError] = useState<string | null>(null);

  const [submissionText, setSubmissionText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingHomework, setIsEditingHomework] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { homework, loading, error, refetch } = useHomework(homeworkId);

  const submissionIds = userRole === "ADMIN" ? homework?.submissions : undefined;
  const {
    submissions,
    loading: loadingSubmissions,
    fetchSubmissions,
    updateSubmission,
  } = useSubmissions(submissionIds);

  useEffect(() => {
    if (homework && userRole === "ADMIN" && homework.submissions?.length > 0) {
      fetchSubmissions();
    }
  }, [homework, fetchSubmissions, userRole]);

  const {
    submission: mySubmission,
    loading: loadingMySubmission,
    setSubmission: setMySubmission,
  } = useMySubmission(userRole === "STUDENT" ? homework?.id : undefined, userId);

  useEffect(() => {
    if (mySubmission) {
      setSubmissionText(mySubmission.text);
    }
  }, [mySubmission]);

  useEffect(() => {
    if (selectedSubmission) {
      setGradeScore(selectedSubmission.score);
      setGradeFeedback(selectedSubmission.feedback || "");
      setGradingError(null);
    }
  }, [selectedSubmission]);

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setTimeout(() => {
      gradingPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleGradeSubmit = async () => {
    if (!selectedSubmission) return;

    setGradingSaving(true);
    setGradingError(null);

    try {
      const res = await fetch(
        `http://localhost:3000/api/homework-submissions/${selectedSubmission.id}/grade`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: gradeScore, feedback: gradeFeedback }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      updateSubmission(data.data);
      setSelectedSubmission(data.data);
    } catch (err) {
      setGradingError(err instanceof Error ? err.message : "Failed to save grade");
    } finally {
      setGradingSaving(false);
    }
  };

  const handleResetGrade = async () => {
    if (!selectedSubmission) return;
    if (!confirm("Are you sure you want to reset this grade? The submission will return to pending status.")) return;

    setGradingSaving(true);
    setGradingError(null);

    try {
      const res = await fetch(
        `http://localhost:3000/api/homework-submissions/${selectedSubmission.id}/grade`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: null, feedback: "" }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      updateSubmission(data.data);
      setSelectedSubmission(data.data);
      setGradeScore(null);
      setGradeFeedback("");
    } catch (err) {
      setGradingError(err instanceof Error ? err.message : "Failed to reset grade");
    } finally {
      setGradingSaving(false);
    }
  };

  const handleStudentSubmit = async (): Promise<boolean> => {
    if (!homework || !submissionText.trim() || !userId) return false;

    setSaving(true);
    setSaveError(null);

    try {
      const isCreate = !mySubmission;
      const url = isCreate
        ? `http://localhost:3000/api/homeworks/${homework.id}/submissions`
        : `http://localhost:3000/api/homework-submissions/${mySubmission.id}/content`;
      
      const body = isCreate
        ? { studentId: userId, studentName: user?.username, text: submissionText }
        : { studentId: mySubmission.studentId, studentName: user?.username, text: submissionText };

      const res = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setMySubmission(data.data);
      return true;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save submission");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!homework) return;
    if (!confirm("Are you sure you want to delete this homework?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:3000/api/homeworks/${homework.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tutorId: userId }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      navigate(-1);
    } catch (err) {
      console.error("Failed to delete homework:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !homework) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-4">
        <div className="text-red-500">{error || "Homework not found"}</div>
        <button
          onClick={() => navigate("/")}
          className="btn btn-neutral btn-sm"
        >
          Back to Homework List
        </button>
      </div>
    );
  }

  const { isOverdue, text: timeText } = getTimeRemaining(homework.dueDate);

  return (
    <div className={`w-full p-4 sm:p-6 md:p-8 ${userRole === "STUDENT" ? "min-h-full lg:h-dvh lg:flex lg:flex-col" : "min-h-full"}`}>
      <div className="flex items-center justify-between mb-6 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        {userRole === "ADMIN" && !isEditingHomework && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditingHomework(true)}
              disabled={isOverdue}
              className="btn btn-primary btn-sm"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-error btn-sm"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${userRole === "STUDENT" ? "lg:flex-1 lg:flex lg:flex-col lg:min-h-0" : ""}`}>
        <div className={`p-4 sm:p-6 border-b border-gray-200 ${userRole === "STUDENT" ? "lg:shrink-0" : ""}`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              {homework.title}
            </h1>
            <div className="flex items-center gap-3">
              <span className={`badge ${isOverdue ? "badge-error" : "badge-success badge-outline"}`}>
                {timeText}
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Due: {new Date(homework.dueDate).toLocaleString()}
          </div>
        </div>

        {userRole === "ADMIN" && isEditingHomework && (
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <HomeworkForm
              mode="update"
              courseId={homework.courseId}
              homeworkId={homework.id.toString()}
              initialData={{
                title: homework.title,
                description: homework.description,
                dueDate: homework.dueDate.split("T")[0],
              }}
              onSuccess={() => {
                setIsEditingHomework(false);
                refetch();
              }}
              onCancel={() => setIsEditingHomework(false)}
            />
          </div>
        )}

        {userRole === "ADMIN" && !isEditingHomework && (
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Description
            </h2>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {homework.description}
            </div>
          </div>
        )}

        {userRole === "STUDENT" && (
          <div className="p-4 sm:p-6 border-b border-gray-200 lg:flex-1 lg:flex lg:flex-col lg:min-h-0">
            <div className="flex flex-col lg:flex-row gap-6 lg:flex-1 lg:min-h-0">
              <div className="lg:w-1/2 lg:h-full flex flex-col">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 shrink-0">
                  Description
                </h2>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[150px] max-h-[300px] lg:min-h-0 lg:max-h-none lg:flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4">
                  {homework.description}
                </div>
              </div>

              <div className="lg:w-1/2 lg:h-full flex flex-col">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 shrink-0">
                  Your Submission
                </h2>
                
                {loadingMySubmission ? (
                  <div className="text-gray-500">Loading...</div>
                ) : (() => {
                  const isGraded = mySubmission?.score !== null && mySubmission?.score !== undefined;
                  const canEdit = !isOverdue && !isGraded;

                  return (
                    <div className="lg:flex-1 flex flex-col lg:min-h-0">
                      {isGraded && (
                        <div className="alert alert-info mb-4 shrink-0">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">Grade:</span>
                              <span className="text-lg font-bold">{mySubmission.score}/100</span>
                            </div>
                            {mySubmission.feedback && (
                              <div>
                                <span className="font-semibold">Feedback:</span>
                                <span className="ml-2 whitespace-pre-wrap">{mySubmission.feedback}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="lg:flex-1 flex flex-col lg:min-h-0">
                        {saveError && (
                          <div className="alert alert-error py-2 mb-2 shrink-0">
                            <span className="text-sm">{saveError}</span>
                          </div>
                        )}

                        {!mySubmission && !isOverdue && (
                          <div className="lg:flex-1 flex flex-col lg:min-h-0">
                            <textarea
                              value={submissionText}
                              onChange={(e) => setSubmissionText(e.target.value)}
                              placeholder="Type your answer here..."
                              className="textarea textarea-bordered min-h-[200px] lg:min-h-0 lg:flex-1 w-full resize-none"
                            />
                            <div className="flex items-end justify-between mt-3 shrink-0">
                              <p className="text-sm text-base-content/60">
                                Submit your work before the deadline.
                              </p>
                              <button
                                onClick={handleStudentSubmit}
                                disabled={saving || !submissionText.trim()}
                                className="btn btn-success"
                              >
                                {saving ? "Saving..." : "Submit"}
                              </button>
                            </div>
                          </div>
                        )}

                        {!mySubmission && isOverdue && (
                          <p className="text-gray-500 italic">
                            Deadline has passed. No submission was made.
                          </p>
                        )}

                        {mySubmission && !isEditing && (
                          <div className="lg:flex-1 flex flex-col lg:min-h-0">
                            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap min-h-[150px] max-h-[300px] lg:min-h-0 lg:max-h-none lg:flex-1 overflow-y-auto">
                              {mySubmission.text}
                            </div>
                            <div className="flex items-end justify-between mt-3 shrink-0">
                              <div className="text-base text-gray-500">
                                Submitted: {new Date(mySubmission.submittedAt).toLocaleString()}
                              </div>
                              {canEdit && (
                                <button
                                  onClick={() => {
                                    setSubmissionText(mySubmission.text);
                                    setIsEditing(true);
                                  }}
                                  className="btn btn-primary"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                            {!canEdit && (
                              <p className="text-sm text-gray-500 italic mt-2 shrink-0">
                                {isGraded 
                                  ? "This submission has been graded and can no longer be edited."
                                  : "The deadline has passed. You can no longer edit your submission."}
                              </p>
                            )}
                          </div>
                        )}

                        {mySubmission && isEditing && (
                          <div className="lg:flex-1 flex flex-col lg:min-h-0">
                            <textarea
                              value={submissionText}
                              onChange={(e) => setSubmissionText(e.target.value)}
                              placeholder="Type your answer here..."
                              className="textarea textarea-bordered min-h-[200px] lg:min-h-0 lg:flex-1 w-full resize-none"
                            />
                            <div className="flex items-center justify-end mt-3 shrink-0">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSubmissionText(mySubmission.text);
                                    setIsEditing(false);
                                    setSaveError(null);
                                  }}
                                  disabled={saving}
                                  className="btn btn-outline"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={async () => {
                                    const success = await handleStudentSubmit();
                                    if (success) setIsEditing(false);
                                  }}
                                  disabled={saving || !submissionText.trim()}
                                  className="btn btn-primary"
                                >
                                  {saving ? "Saving..." : "Save Changes"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {userRole === "ADMIN" && !isEditingHomework && (
          <div className="p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Submissions ({homework.submissions?.length || 0})
            </h2>
            {loadingSubmissions ? (
              <div className="text-gray-500">Loading submissions...</div>
            ) : submissions.length > 0 ? (
              <div className={`flex flex-col lg:flex-row gap-4 ${selectedSubmission ? "lg:h-[80vh]" : ""}`}>
                <div className={`${selectedSubmission ? "lg:w-1/2 h-full" : "w-full"} transition-all flex flex-col gap-4`}>
                  {(() => {
                    const gradedSubmissions = submissions.filter(s => s.score !== null);
                    const pendingCount = submissions.length - gradedSubmissions.length;
                    const avgScore = gradedSubmissions.length > 0
                      ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length)
                      : null;
                    const minScore = gradedSubmissions.length > 0
                      ? Math.min(...gradedSubmissions.map(s => s.score || 0))
                      : null;
                    const maxScore = gradedSubmissions.length > 0
                      ? Math.max(...gradedSubmissions.map(s => s.score || 0))
                      : null;

                    return (
                      <div className="stats stats-horizontal shadow-sm border border-base-200 w-full">
                        <div className="stat py-3 px-4">
                          <div className="stat-title text-xs">Pending</div>
                          <div className={`stat-value text-lg ${pendingCount > 0 ? "text-warning" : "text-success"}`}>
                            {pendingCount}
                          </div>
                        </div>
                        <div className="stat py-3 px-4">
                          <div className="stat-title text-xs">Graded</div>
                          <div className="stat-value text-lg">{gradedSubmissions.length}</div>
                        </div>
                        <div className="stat py-3 px-4">
                          <div className="stat-title text-xs">Avg Score</div>
                          <div className="stat-value text-lg">{avgScore !== null ? avgScore : "—"}</div>
                        </div>
                        <div className="stat py-3 px-4">
                          <div className="stat-title text-xs">Range</div>
                          <div className="stat-value text-lg">
                            {minScore !== null ? `${minScore}–${maxScore}` : "—"}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="border border-gray-200 rounded-lg flex-1 overflow-y-auto">
                    <SubmissionsTable
                      submissions={submissions}
                      selectedId={selectedSubmission?.id}
                      onRowClick={handleSelectSubmission}
                    />
                  </div>
                </div>

                {selectedSubmission && (
                  <div ref={gradingPanelRef} className="lg:w-1/2 h-full">
                    <div className="border border-gray-200 rounded-lg p-4 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4 shrink-0">
                        <h3 className="font-semibold text-gray-900">Grade Submission</h3>
                        <button
                          onClick={() => setSelectedSubmission(null)}
                          className="btn btn-ghost btn-sm btn-circle"
                        >
                          &times;
                        </button>
                      </div>

                      {gradingError && (
                        <div className="alert alert-error py-2 mb-4 shrink-0">
                          <span className="text-sm">{gradingError}</span>
                        </div>
                      )}

                      <div className="mb-4 shrink-0 flex gap-4">
                        <div className="form-control flex-1">
                          <label className="label py-1">
                            <span className="label-text font-medium">Student</span>
                          </label>
                          <p className="bg-base-200 px-3 py-2 rounded-lg text-sm">
                            {selectedSubmission.studentName || selectedSubmission.studentId}
                          </p>
                        </div>
                        <div className="form-control flex-1">
                          <label className="label py-1">
                            <span className="label-text font-medium">Submitted At</span>
                          </label>
                          <p className="bg-base-200 px-3 py-2 rounded-lg text-sm">
                            {new Date(selectedSubmission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="form-control mb-4 flex-1 min-h-0 flex flex-col">
                        <div className="flex items-center justify-between shrink-0">
                          <label className="label py-1">
                            <span className="label-text font-medium">Submission Content</span>
                          </label>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedSubmission.text);
                            }}
                            className="btn btn-ghost btn-xs btn-square"
                            title="Copy to clipboard"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                        <div className="bg-base-200 px-3 py-2 rounded-lg whitespace-pre-wrap flex-1 overflow-y-auto text-sm">
                          {selectedSubmission.text}
                        </div>
                      </div>

                      <div className="shrink-0 space-y-4">
                        <div className="form-control">
                          <label htmlFor="score" className="label py-1">
                            <span className="label-text font-medium">
                              Score <span className="text-error">*</span>
                            </span>
                          </label>
                          <input
                            type="number"
                            id="score"
                            min={0}
                            max={100}
                            value={gradeScore ?? ""}
                            onChange={(e) =>
                              setGradeScore(e.target.value === "" ? null : Number(e.target.value))
                            }
                            placeholder="Enter score (0-100)"
                            className="input input-bordered input-sm w-full"
                            required
                          />
                        </div>

                        <div className="form-control">
                          <label htmlFor="feedback" className="label py-1">
                            <span className="label-text font-medium">Feedback</span>
                          </label>
                          <textarea
                            id="feedback"
                            value={gradeFeedback}
                            onChange={(e) => setGradeFeedback(e.target.value)}
                            rows={3}
                            placeholder="Enter feedback for the student..."
                            className="textarea textarea-bordered text-sm w-full resize-none"
                          />
                        </div>

                        <div className="flex gap-2">
                          {selectedSubmission.score !== null && (
                            <button
                              type="button"
                              onClick={handleResetGrade}
                              disabled={gradingSaving}
                              className="btn btn-neutral flex-1"
                            >
                              Reset Grade
                            </button>
                          )}
                          <button
                            onClick={handleGradeSubmit}
                            disabled={gradingSaving || gradeScore === null}
                            className="btn btn-primary flex-1"
                          >
                            {gradingSaving ? "Saving..." : "Save Grade"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No submissions yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
