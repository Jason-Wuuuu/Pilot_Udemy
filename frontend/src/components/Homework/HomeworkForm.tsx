import { useState, useEffect } from "react";
import { useAppSelector } from "../../store/hooks";

interface HomeworkFormData {
  title: string;
  description: string;
  dueDate: string;
}

function getDefaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split("T")[0];
}

interface HomeworkFormProps {
  mode: "create" | "update";
  courseId: string;
  homeworkId?: string;
  initialData?: HomeworkFormData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function HomeworkForm({ 
  mode,
  courseId,
  homeworkId, 
  initialData,
  onSuccess,
  onCancel 
}: HomeworkFormProps) {
  const userId = useAppSelector((state) => state.auth.user?.id);

  const [formData, setFormData] = useState<HomeworkFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    dueDate: initialData?.dueDate || getDefaultDueDate(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || "",
        dueDate: initialData.dueDate,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = mode === "create" 
        ? "http://localhost:3000/api/homeworks"
        : `http://localhost:3000/api/homeworks/${homeworkId}`;

      const body = mode === "create"
        ? {
            tutorId: userId,
            courseId: courseId,
            title: formData.title,
            description: formData.description,
            dueDate: formData.dueDate,
          }
        : {
            tutorId: userId,
            title: formData.title,
            description: formData.description,
            dueDate: formData.dueDate,
          };

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg sm:text-xl font-bold">
            {mode === "create" ? "Create Homework" : "Update Homework"}
          </h3>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-ghost btn-sm btn-circle"
            >
              ✕
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-error py-2">
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="form-control">
          <label htmlFor="title" className="label py-1">
            <span className="label-text font-medium">Title</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input input-bordered input-sm"
            required
          />
        </div>

        <div className="form-control">
          <label htmlFor="description" className="label py-1">
            <span className="label-text font-medium">Description</span>
            <span className="label-text-alt">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="textarea textarea-bordered text-sm min-h-[30vh] resize-none"
          />
        </div>

        <div className="form-control">
          <label htmlFor="dueDate" className="label py-1">
            <span className="label-text font-medium">Due Date</span>
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="input input-bordered input-sm"
            required
          />
        </div>

        <div className="modal-action mt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-sm"
          >
            {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}
          </button>
        </div>
      </div>
    </form>
  );
}
