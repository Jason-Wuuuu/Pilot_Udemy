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
      <div className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6 border border-gray-300 rounded-md bg-white shadow-lg">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
          {mode === "create" ? "Create Homework" : "Update Homework"}
        </h2>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="text-sm px-3 py-2 min-h-[30vh] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="text-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-end gap-2 sm:gap-3 mt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`text-sm px-4 py-2 rounded text-white ${
              loading 
                ? "bg-blue-300 cursor-not-allowed" 
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}
          </button>
        </div>
      </div>
    </form>
  );
}
