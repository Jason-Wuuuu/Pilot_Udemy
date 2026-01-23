import { useEffect, useState, useCallback } from "react";
import type { Homework } from "../types/homework";

interface CourseWithHomeworks {
  course: {
    courseId: string;
    courseName: string;
    description: string;
    categoryName: string;
    level: string;
    instructor: string;
  };
  homeworks: Homework[];
}

export function useHomeworks(
  lectureId: string | null,
  studentId?: string,
  notOverdue?: boolean,
  userRole?: string,
) {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [coursesWithHomeworks, setCoursesWithHomeworks] = useState<
    CourseWithHomeworks[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomeworks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let res: Response;
      if (lectureId) {
        // homeworks for a specific lecture
        res = await fetch(
          `http://localhost:3000/api/homeworks?courseId=${lectureId}`,
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const { data } = await res.json();
        setHomeworks(data);
        setCoursesWithHomeworks([]);
      } else if (userRole === "ADMIN") {
        // all homeworks
        res = await fetch(`http://localhost:3000/api/homeworks`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const { data } = await res.json();
        setHomeworks(data);
        setCoursesWithHomeworks([]);
      } else if (studentId) {
        // all homeworks for a student
        const url = new URL(
          `http://localhost:3000/api/homeworks/student/${studentId}`,
        );
        if (notOverdue) {
          url.searchParams.set("notOverdue", "true");
        }
        res = await fetch(url.toString());
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const { data } = await res.json();
        setCoursesWithHomeworks(data);
        const allHomeworks = data.flatMap(
          (item: CourseWithHomeworks) => item.homeworks,
        );
        setHomeworks(allHomeworks);
      } else {
        setHomeworks([]);
        setCoursesWithHomeworks([]);
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load homeworks");
    } finally {
      setLoading(false);
    }
  }, [lectureId, studentId, notOverdue, userRole]);

  useEffect(() => {
    fetchHomeworks();
  }, [fetchHomeworks]);

  return {
    homeworks,
    coursesWithHomeworks,
    loading,
    error,
    refetch: fetchHomeworks,
  };
}
