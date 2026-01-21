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
                className={`cursor-pointer transition-colors ${
                  selectedId === sub.id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => onRowClick?.(sub)}
              >
                <td className="px-3 py-2 text-gray-800">{sub.studentName || sub.studentId}</td>
                <td className="px-3 py-2 text-gray-600">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                <td className="px-3 py-2 text-gray-800">{sub.score !== null ? sub.score : "—"}</td>
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
      ) : (
        <p className="text-sm text-gray-500 p-3">No submissions yet</p>
      )}
    </div>
  );
}
