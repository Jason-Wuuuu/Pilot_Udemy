import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import SubmissionModal from "../HomeworkSubmission/SubmissionModal";
import { useMySubmission } from "../../hooks/useMySubmission";
import { useAppSelector } from "../../store/hooks";
import { getTimeRemaining } from "../../utils/time";
import type { Homework, Submission } from "../../types/homework";

interface HomeworkCardProps {
  homework: Homework;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function HomeworkCard({
  homework,
  onUpdate,
  onDelete,
}: HomeworkCardProps) {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id;
  const userRole = user?.role;

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Student
  const {
    submission: mySubmission,
    loading: loadingMySubmission,
    setSubmission: setMySubmission,
  } = useMySubmission(userRole === "STUDENT" ? homework.id : undefined, userId);

  const { isOverdue, text } = getTimeRemaining(homework.dueDate);

  const handleSubmissionSave = (updatedSubmission: Submission) => {
    setMySubmission(updatedSubmission);
    setSelectedSubmission(null);
  };

  const handleCreateSubmission = (newSubmission: Submission) => {
    setMySubmission(newSubmission);
    setShowCreateModal(false);
  };

  useEffect(() => {
    const el = descriptionRef.current;
    if (el) {
      setHasOverflow(el.scrollHeight > el.clientHeight);
    }
  }, [homework.description]);

  return (
    <div className={`border border-gray-300 rounded-md overflow-hidden flex flex-col ${
      isExpanded ? "" : "h-56 @sm:h-64 @md:h-80 @lg:h-96"
    }`}>
      <div className="p-2 @sm:p-3 @md:p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-base @sm:text-lg @md:text-xl @lg:text-2xl font-bold">{homework.title}</h2>
          <button
            onClick={() => navigate(`/homework/${homework.id}`)}
            className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer"
            title="Expand to full page"
          >
            <svg className="w-4 h-4 @sm:w-5 @sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
        <div 
          ref={descriptionRef}
          className={`text-xs @sm:text-sm @md:text-base @lg:text-lg text-gray-500 whitespace-pre-wrap ${
            isExpanded ? "" : "h-20 @sm:h-24 @md:h-32 @lg:h-40 overflow-hidden"
          }`}
        >
          {homework.description}
        </div>
        <div className="h-6 @sm:h-7 mt-2 mb-2">
          {(hasOverflow || isExpanded) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs @sm:text-sm text-blue-500 hover:text-blue-700"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
        <div className="flex justify-end items-end gap-2 mt-auto">
          {userRole === "ADMIN" ? (
            <>
              <span className="text-xs @sm:text-sm @md:text-base text-gray-600 font-medium mr-2">
                {homework.submissions?.length || 0} submission{(homework.submissions?.length || 0) !== 1 ? "s" : ""}
              </span>
              <button 
                onClick={onUpdate}
                className="text-xs @sm:text-sm px-2 @sm:px-3 py-1 @sm:py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
              >
                Update
              </button>
              <button 
                onClick={onDelete}
                className="text-xs @sm:text-sm px-2 @sm:px-3 py-1 @sm:py-1.5 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              {loadingMySubmission ? (
                <span className="text-xs @sm:text-sm text-gray-500">Loading...</span>
              ) : mySubmission ? (
                (() => {
                  const isGraded = mySubmission.score !== null && mySubmission.score !== undefined;
                  const canEdit = !isOverdue && !isGraded;
                  return (
                    <div className="flex items-center gap-2">
                      {isGraded && (
                        <span className="text-xs @sm:text-sm font-semibold px-2 @sm:px-3 py-1 @sm:py-1.5 bg-blue-100 text-blue-800 rounded">
                          Score: {mySubmission.score}/100
                        </span>
                      )}
                      <button 
                        onClick={() => setSelectedSubmission(mySubmission)}
                        className="text-xs @sm:text-sm px-2 @sm:px-3 py-1 @sm:py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                      >
                        {canEdit ? "Edit Submission" : "View Details"}
                      </button>
                    </div>
                  );
                })()
              ) : (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  disabled={isOverdue}
                  className={`text-xs @sm:text-sm px-2 @sm:px-3 py-1 @sm:py-1.5 rounded ${
                    isOverdue 
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                      : "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                  }`}
                >
                  Submit
                </button>
              )}
            </>
          )}
        </div>
        </div>
      <div className="border-t border-gray-200 px-2 @sm:px-3 @md:px-4 py-1.5 @sm:py-2 flex justify-between items-center bg-gray-50">
        <span className="text-xs @sm:text-sm text-gray-500">Due: {homework.dueDate}</span>
        <span className={`text-xs @sm:text-sm font-medium ${isOverdue ? "text-red-500" : "text-green-600"}`}>
          {text}
        </span>
      </div>

      {/* Student View/Edit Submission Modal */}
      {selectedSubmission && userRole === "STUDENT" && (
        <SubmissionModal
          submission={selectedSubmission}
          isOverdue={isOverdue}
          onClose={() => setSelectedSubmission(null)}
          onSave={handleSubmissionSave}
        />
      )}

      {/* Student Create Submission Modal */}
      {showCreateModal && userRole === "STUDENT" && (
        <SubmissionModal
          homeworkId={String(homework.id)}
          homeworkTitle={homework.title}
          isOverdue={isOverdue}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateSubmission}
        />
      )}
    </div>
  );
}
