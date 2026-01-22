import type { Submission } from "../../types/homework";

interface SubmissionsTableProps {
  submissions: Submission[];
  selectedId?: string;
  onRowClick?: (submission: Submission) => void;
}

export default function SubmissionsTable({ submissions, selectedId, onRowClick }: SubmissionsTableProps) {
  return (
    <div className="overflow-x-auto">
      {submissions.length > 0 ? (
        <table className="table table-sm table-pin-rows">
          <thead>
            <tr>
              <th>Student</th>
              <th>Submitted</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr 
                key={sub.id} 
                className={`cursor-pointer hover ${selectedId === sub.id ? "active" : ""}`}
                onClick={() => onRowClick?.(sub)}
              >
                <td>{sub.studentName || sub.studentId}</td>
                <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                <td>{sub.score !== null ? sub.score : "—"}</td>
                <td>
                  {sub.score !== null ? (
                    <span className="badge badge-success badge-sm">Graded</span>
                  ) : (
                    <span className="badge badge-warning badge-sm">Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-base-content/60 p-3">No submissions yet</p>
      )}
    </div>
  );
}
