import { useState, useCallback } from "react";
import type { Submission } from "../types/homework";

export function useSubmissions(submissionIds: string[] | undefined) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!submissionIds?.length) {
      setSubmissions([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        submissionIds.map(async (id) => {
          const res = await fetch(`http://localhost:3000/api/homework-submissions/${id}`);
          if (!res.ok) throw new Error(`Failed to fetch submission ${id}`);
          return res.json();
        })
      );
      setSubmissions(results.map((r) => r.data));
    } catch {
      setError("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [submissionIds]);

  const updateSubmission = (updatedSubmission: Submission) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === updatedSubmission.id ? updatedSubmission : sub))
    );
  };

  return { submissions, loading, error, fetchSubmissions, updateSubmission };
}
