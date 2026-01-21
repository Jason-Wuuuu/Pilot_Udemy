import { useEffect, useState } from "react";
import type { Submission } from "../types/homework";

export function useMySubmission(homeworkId: number | string | undefined, studentId: string | undefined) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!homeworkId || !studentId) return;

    const fetchSubmission = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:3000/api/homeworks/${homeworkId}/submissions/my?studentId=${studentId}`
        );
        if (res.ok) {
          const data = await res.json();
          setSubmission(data.data);
        } else if (res.status === 404) {
          setSubmission(null);
        } else {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load submission");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [homeworkId, studentId]);

  const updateSubmission = (updated: Submission) => {
    setSubmission(updated);
  };

  return { submission, loading, error, setSubmission: updateSubmission };
}
