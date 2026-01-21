import { useEffect, useState, useCallback } from "react";
import type { Homework } from "../types/homework";

export function useHomework(homeworkId: string | undefined) {
  const [homework, setHomework] = useState<Homework | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomework = useCallback(async () => {
    if (!homeworkId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/homeworks/${homeworkId}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const { data } = await res.json();
      setHomework(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load homework");
    } finally {
      setLoading(false);
    }
  }, [homeworkId]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  return { homework, loading, error, refetch: fetchHomework };
}
