import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useHomework } from "../../hooks/useHomework";
import { useSubmissions } from "../../hooks/useSubmissions";
import { useMySubmission } from "../../hooks/useMySubmission";
import { useAppSelector } from "../../store/hooks";
import { getTimeRemaining } from "../../utils/time";
import type { Submission } from "../../types/homework";

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

  const { homework, loading, error } = useHomework(homeworkId);

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
        ? { studentId: userId, text: submissionText }
        : { studentId: mySubmission.studentId, text: submissionText };

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
          className="text-sm px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Homework List
        </button>
      </div>
    );
  }

  const { isOverdue, text: timeText } = getTimeRemaining(homework.dueDate);

  return (
    <div className={`w-full p-4 sm:p-6 md:p-8 ${userRole === "STUDENT" ? "min-h-full lg:h-dvh lg:flex lg:flex-col" : "min-h-full"}`}>
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <button
          onClick={() => navigate("/")}
          className="text-sm px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded flex items-center gap-1 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${userRole === "STUDENT" ? "lg:flex-1 lg:flex lg:flex-col lg:min-h-0" : ""}`}>
        <div className={`p-4 sm:p-6 border-b border-gray-200 ${userRole === "STUDENT" ? "lg:shrink-0" : ""}`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              {homework.title}
            </h1>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                isOverdue 
                  ? "bg-red-100 text-red-700" 
                  : "bg-green-100 text-green-700"
              }`}>
                {timeText}
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Due: {new Date(homework.dueDate).toLocaleString()}
          </div>
        </div>

        {userRole === "ADMIN" && (
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
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 shrink-0">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-xl font-bold text-blue-800">Grade:</span>
                            <span className="text-xl font-bold text-blue-800">{mySubmission.score}/100</span>
                          </div>
                          {mySubmission.feedback && (
                            <div>
                              <span className="text-base font-bold text-blue-800">Feedback:</span>
                              <span className="mt-1 ml-4 text-base font-medium text-blue-900 whitespace-pre-wrap">{mySubmission.feedback}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="lg:flex-1 flex flex-col lg:min-h-0">
                        {saveError && (
                          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg mb-2 shrink-0">
                            {saveError}
                          </div>
                        )}

                        {!mySubmission && !isOverdue && (
                          <div className="lg:flex-1 flex flex-col lg:min-h-0">
                            <textarea
                              value={submissionText}
                              onChange={(e) => setSubmissionText(e.target.value)}
                              placeholder="Type your answer here..."
                              className="min-h-[200px] lg:min-h-0 lg:flex-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700"
                            />
                            <div className="flex items-end justify-between mt-3 shrink-0">
                              <p className="text-sm text-gray-500">
                                Submit your work before the deadline.
                              </p>
                              <button
                                onClick={handleStudentSubmit}
                                disabled={saving || !submissionText.trim()}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                  saving || !submissionText.trim()
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-green-500 text-white hover:bg-green-600"
                                }`}
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
                                  className="px-6 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
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
                              className="min-h-[200px] lg:min-h-0 lg:flex-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700"
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
                                  className="px-4 py-2 rounded-lg font-medium border border-gray-300 hover:bg-gray-100 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={async () => {
                                    const success = await handleStudentSubmit();
                                    if (success) setIsEditing(false);
                                  }}
                                  disabled={saving || !submissionText.trim()}
                                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                    saving || !submissionText.trim()
                                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      : "bg-blue-500 text-white hover:bg-blue-600"
                                  }`}
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

        {userRole === "ADMIN" && (
          <div className="p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Submissions ({homework.submissions?.length || 0})
            </h2>
            {loadingSubmissions ? (
              <div className="text-gray-500">Loading submissions...</div>
            ) : submissions.length > 0 ? (
              <div className={`flex flex-col lg:flex-row gap-4 ${selectedSubmission ? "lg:h-[80vh]" : ""}`}>
                <div className={`${selectedSubmission ? "lg:w-1/2 h-full" : "w-full"} transition-all`}>
                  <div className="border border-gray-200 rounded-lg h-full overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 text-left sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2 font-medium text-gray-700 bg-gray-100">Student</th>
                          <th className="px-3 py-2 font-medium text-gray-700 bg-gray-100">Submitted</th>
                          <th className="px-3 py-2 font-medium text-gray-700 bg-gray-100">Score</th>
                          <th className="px-3 py-2 font-medium text-gray-700 bg-gray-100">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {submissions.map((sub) => (
                          <tr
                            key={sub.id}
                            onClick={() => handleSelectSubmission(sub)}
                            className={`cursor-pointer transition-colors ${
                              selectedSubmission?.id === sub.id
                                ? "bg-blue-50"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-3 py-2 text-gray-800">{sub.studentId}</td>
                            <td className="px-3 py-2 text-gray-600">
                              {new Date(sub.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-2 text-gray-800">
                              {sub.score !== null ? sub.score : "—"}
                            </td>
                            <td className="px-3 py-2">
                              {sub.score !== null ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Graded
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedSubmission && (
                  <div ref={gradingPanelRef} className="lg:w-1/2 h-full">
                    <div className="border border-gray-200 rounded-lg p-4 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4 shrink-0">
                        <h3 className="font-semibold text-gray-900">Grade Submission</h3>
                        <button
                          onClick={() => setSelectedSubmission(null)}
                          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                        >
                          &times;
                        </button>
                      </div>

                      {gradingError && (
                        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg mb-4 shrink-0">
                          {gradingError}
                        </div>
                      )}

                      <div className="mb-4 shrink-0">
                        <label className="text-sm font-medium text-gray-700">Student</label>
                        <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded mt-1">
                          {selectedSubmission.studentId}
                        </p>
                      </div>

                      <div className="mb-4 shrink-0">
                        <label className="text-sm font-medium text-gray-700">Submitted At</label>
                        <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded mt-1">
                          {new Date(selectedSubmission.submittedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="mb-4 flex-1 min-h-0 flex flex-col">
                        <div className="flex items-center justify-between shrink-0">
                          <label className="text-sm font-medium text-gray-700">Submission Content</label>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selectedSubmission.text);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            title="Copy to clipboard"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-gray-800 bg-gray-50 px-3 py-2 rounded mt-1 whitespace-pre-wrap flex-1 overflow-y-auto">
                          {selectedSubmission.text}
                        </div>
                      </div>

                      <div className="shrink-0 space-y-4">
                        <div>
                          <label htmlFor="score" className="text-sm font-medium text-gray-700">
                            Score <span className="text-red-500">*</span>
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
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="feedback" className="text-sm font-medium text-gray-700">
                            Feedback
                          </label>
                          <textarea
                            id="feedback"
                            value={gradeFeedback}
                            onChange={(e) => setGradeFeedback(e.target.value)}
                            rows={3}
                            placeholder="Enter feedback for the student..."
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        </div>

                        <div className="flex gap-2">
                          {selectedSubmission.score !== null && (
                            <button
                              type="button"
                              onClick={handleResetGrade}
                              disabled={gradingSaving}
                              className={`flex-1 py-2 rounded font-medium transition-colors ${
                                gradingSaving
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-gray-500 text-white hover:bg-gray-600"
                              }`}
                            >
                              Reset Grade
                            </button>
                          )}
                          <button
                            onClick={handleGradeSubmit}
                            disabled={gradingSaving || gradeScore === null}
                            className={`flex-1 py-2 rounded font-medium transition-colors ${
                              gradingSaving || gradeScore === null
                                ? "bg-blue-300 text-white cursor-not-allowed"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
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
