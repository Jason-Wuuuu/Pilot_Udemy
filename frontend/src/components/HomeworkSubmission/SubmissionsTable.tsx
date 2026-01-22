import { useState, useMemo } from "react";
import type { Submission } from "../../types/homework";

type SortColumn = "student" | "submitted" | "score" | "status";
type SortDirection = "asc" | "desc";

interface SubmissionsTableProps {
  submissions: Submission[];
  selectedId?: string;
  onRowClick?: (submission: Submission) => void;
}

export default function SubmissionsTable({
  submissions,
  selectedId,
  onRowClick,
}: SubmissionsTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("submitted");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case "student": {
          const nameA = a.studentName || a.studentId || "";
          const nameB = b.studentName || b.studentId || "";
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case "submitted":
          comparison =
            new Date(a.submittedAt).getTime() -
            new Date(b.submittedAt).getTime();
          break;
        case "score": {
          const scoreA = a.score ?? -1;
          const scoreB = b.score ?? -1;
          comparison = scoreA - scoreB;
          break;
        }
        case "status": {
          const statusA = a.score !== null ? 1 : 0;
          const statusB = b.score !== null ? 1 : 0;
          comparison = statusA - statusB;
          break;
        }
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [submissions, sortColumn, sortDirection]);

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return null;
    }
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  const headerClass =
    "cursor-pointer select-none hover:bg-base-200 transition-colors";

  return (
    <div className="overflow-x-auto">
      {submissions.length > 0 ? (
        <table className="table table-sm table-pin-rows">
          <thead>
            <tr>
              <th className={headerClass} onClick={() => handleSort("student")}>
                Student {getSortIcon("student")}
              </th>
              <th
                className={headerClass}
                onClick={() => handleSort("submitted")}
              >
                Submitted {getSortIcon("submitted")}
              </th>
              <th className={headerClass} onClick={() => handleSort("score")}>
                Score {getSortIcon("score")}
              </th>
              <th className={headerClass} onClick={() => handleSort("status")}>
                Status {getSortIcon("status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedSubmissions.map((sub) => (
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
                    <span className="badge badge-success badge-outline badge-sm">
                      Graded
                    </span>
                  ) : (
                    <span className="badge badge-warning badge-sm">
                      Pending
                    </span>
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
