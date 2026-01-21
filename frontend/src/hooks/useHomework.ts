import { useEffect, useState } from "react";
import type { Homework } from "../types/homework";

export function useHomework(homeworkId: string | undefined) {
  const [homework, setHomework] = useState<Homework | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!homeworkId) {
      setLoading(false);
      return;
    }

    const fetchHomework = async () => {
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
    };

    fetchHomework();
  }, [homeworkId]);

  return { homework, loading, error };
}
