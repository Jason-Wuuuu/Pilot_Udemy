import { useState } from "react";
import HomeworkForm from "./HomeworkForm";
import HomeworkCard from "./HomeworkCard";
import { useHomeworks } from "../../hooks/useHomeworks";
import { useAppSelector } from "../../store/hooks";
import type { Homework } from "../../types/homework";

export default function Homework({courseId}: {courseId: string}) {
  const user = useAppSelector((state) => state.auth.user);
  const { homeworks, loading, error, refetch } = useHomeworks(courseId);
  const [showForm, setShowForm] = useState<{ mode: "create" | "update"; homework?: Homework } | null>(null);

  if (!user) return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="text-gray-500">Please log in to view homeworks.</div>
    </div>
  );
  if (loading) return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div>Loading...</div>
    </div>
  );
  if (error) return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="text-red-500">Error: {error}</div>
    </div>
  );

  const handleFormSuccess = () => {
    setShowForm(null);
    refetch();
  };

  const handleDelete = async (homeworkId: number) => {
    if (!confirm("Are you sure you want to delete this homework?")) return;
    
    try {
      const res = await fetch(`http://localhost:3000/api/homeworks/${homeworkId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tutorId: user.id }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      refetch();
    } catch (error) {
      console.error("Failed to delete homework:", error);
    }
  };

  return (
    <>
      {showForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowForm(null)}
        >
          <div 
            className="w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <HomeworkForm
              mode={showForm.mode}
              courseId={courseId}
              homeworkId={showForm.homework?.id.toString()}
              initialData={showForm.homework ? {
                title: showForm.homework.title,
                description: showForm.homework.description,
                dueDate: showForm.homework.dueDate,
              } : undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(null)}
            />
          </div>
        </div>
      )}
      <div className="@container w-full h-full p-2 @sm:p-3 @md:p-4">
        <div className="flex items-center justify-between mb-2 @sm:mb-3 @md:mb-4 px-1">
          <h1 className="text-lg @sm:text-2xl @md:text-3xl font-bold">
            Homeworks ({homeworks.length})
          </h1>
          {user.role === "ADMIN" && (
            <button
              onClick={() => setShowForm({ mode: "create" })}
              className="text-xs @sm:text-sm px-3 @sm:px-4 py-2 @sm:py-2.5 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
            >
              Create Homework
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 @2xl:grid-cols-2 items-start gap-2 @sm:gap-3 @md:gap-4">
        {homeworks.map((homework: Homework) => (
          <HomeworkCard
            key={homework.id}
            homework={homework}
            onUpdate={() => setShowForm({ mode: "update", homework })}
            onDelete={() => handleDelete(homework.id)}
          />
        ))}
        </div>
      </div>
    </>
  );
}