import type { Submission } from "../../types/homework";

interface SubmissionsTableProps {
  submissions: Submission[];
  onRowClick?: (submission: Submission) => void;
}

export default function SubmissionsTable({ submissions, onRowClick }: SubmissionsTableProps) {
  return (
    <div className="mt-4 bg-gray-50 rounded border border-gray-200 overflow-hidden">
      {submissions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs @sm:text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-2 @sm:px-3 py-2 font-medium bg-gray-500 text-white">Student</th>
                <th className="px-2 @sm:px-3 py-2 font-medium bg-gray-500 text-white">Submitted</th>
                <th className="px-2 @sm:px-3 py-2 font-medium bg-gray-500 text-white">Score</th>
                <th className="px-2 @sm:px-3 py-2 font-medium bg-gray-500 text-white">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((sub) => (
                <tr 
                  key={sub.id} 
                  className="hover:bg-gray-300 cursor-pointer"
                  onClick={() => onRowClick?.(sub)}
                >
                  <td className="px-2 @sm:px-3 py-2 text-gray-800">{sub.studentId}</td>
                  <td className="px-2 @sm:px-3 py-2 text-gray-600">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-2 @sm:px-3 py-2 text-gray-800">
                    {sub.score !== null ? sub.score : "—"}
                  </td>
                  <td className="px-2 @sm:px-3 py-2">
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
      ) : (
        <p className="text-xs @sm:text-sm text-gray-500 p-2 @sm:p-3">No submissions yet</p>
      )}
    </div>
  );
}
