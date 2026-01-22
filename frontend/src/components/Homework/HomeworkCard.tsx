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
    <div className={`card bg-base-100 overflow-hidden flex flex-col border-2 border-base-300 transition-colors hover:border-base-content/40 ${
      isExpanded ? "" : "h-56 @sm:h-64 @md:h-80 @lg:h-96"
    }`}>
      <div className="card-body p-3 @sm:p-4 @md:p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h2 className="card-title text-base @sm:text-lg @md:text-xl @lg:text-2xl">{homework.title}</h2>
          <button
            onClick={() => navigate(`/homework/${homework.id}`)}
            className="btn btn-ghost btn-xs shrink-0"
            title="Expand to full page"
          >
            <svg className="w-4 h-4 @sm:w-5 @sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
        <div 
          ref={descriptionRef}
          className={`text-xs @sm:text-sm @md:text-base @lg:text-lg text-base-content/70 whitespace-pre-wrap ${
            isExpanded ? "" : "h-20 @sm:h-24 @md:h-32 @lg:h-40 overflow-hidden"
          }`}
        >
          {homework.description}
        </div>
        <div className="h-6 @sm:h-7 mt-2">
          {(hasOverflow || isExpanded) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn btn-link btn-xs @sm:btn-sm p-0 h-auto min-h-0"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
        <div className="card-actions justify-end items-end mt-auto">
          {userRole === "ADMIN" ? (
            <>
              <span className="text-xs @sm:text-sm @md:text-base text-base-content/60 font-medium mr-2">
                {homework.submissions?.length || 0} submission{(homework.submissions?.length || 0) !== 1 ? "s" : ""}
              </span>
              <button 
                onClick={onUpdate}
                disabled={isOverdue}
                className="btn btn-primary btn-xs @sm:btn-sm"
              >
                Edit
              </button>
              <button 
                onClick={onDelete}
                className="btn btn-error btn-xs @sm:btn-sm"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              {loadingMySubmission ? (
                <span className="text-xs @sm:text-sm text-base-content/60">Loading...</span>
              ) : mySubmission ? (
                (() => {
                  const isGraded = mySubmission.score !== null && mySubmission.score !== undefined;
                  const canEdit = !isOverdue && !isGraded;
                  return (
                    <div className="flex items-center gap-2">
                      {isGraded && (
                        <span className="badge badge-info badge-outline badge-sm @sm:badge-md">
                          Score: {mySubmission.score}/100
                        </span>
                      )}
                      <button 
                        onClick={() => setSelectedSubmission(mySubmission)}
                        className="btn btn-primary btn-xs @sm:btn-sm"
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
                  className="btn btn-success btn-xs @sm:btn-sm"
                >
                  Submit
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="border-t border-base-200 px-3 @sm:px-4 @md:px-5 py-4 flex justify-between items-center bg-base-200/50">
        <span className="text-xs @sm:text-sm text-base-content/60">Due: {homework.dueDate}</span>
        <span className={`badge badge-sm @sm:badge-md ${isOverdue ? "badge-error" : "badge-success badge-outline"}`}>
          {text}
        </span>
      </div>

      {selectedSubmission && userRole === "STUDENT" && (
        <SubmissionModal
          submission={selectedSubmission}
          isOverdue={isOverdue}
          onClose={() => setSelectedSubmission(null)}
          onSave={handleSubmissionSave}
        />
      )}

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
