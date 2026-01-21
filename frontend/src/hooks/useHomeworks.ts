import { useEffect, useState, useCallback } from "react";
import type { Homework } from "../types/homework";

export function useHomeworks(courseId: string) {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomeworks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3000/api/homeworks?courseId=${courseId}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const { data } = await res.json();
      setHomeworks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load homeworks");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchHomeworks();
  }, [fetchHomeworks]);

  return { homeworks, loading, error, refetch: fetchHomeworks };
}
