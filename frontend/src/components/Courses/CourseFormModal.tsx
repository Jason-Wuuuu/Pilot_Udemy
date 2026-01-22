import type { Course, CourseLevel } from "../../types/course";
import { useState, useEffect } from "react";

interface CourseFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialData?: Course;
  onSubmit: (payload: Partial<Course>) => Promise<void>;
  onClose: () => void;
}

export default function CourseFormModal({
  open,
  mode,
  initialData,
  onSubmit,
  onClose,
}: CourseFormModalProps) {
  const [form, setForm] = useState<{
    courseName: string;
    description: string;
    categoryName: string;
    instructor: string;
    level: CourseLevel;
  }>({
    courseName: "",
    description: "",
    categoryName: "",
    instructor: "",
    level: "EASY",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form when opening / editing
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialData) {
      setForm({
        courseName: initialData.courseName,
        description: initialData.description,
        categoryName: initialData.categoryName,
        instructor: initialData.instructor,
        level: initialData.level,
      });
    }

    if (mode === "create") {
      setForm({
        courseName: "",
        description: "",
        categoryName: "",
        instructor: "",
        level: "EASY",
      });
    }
  }, [open, mode, initialData]);

  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-xl mb-6">
          {mode === "create" ? "Create course" : "Edit course"}
        </h3>

        {/* Course name */}
        <input
          className="input input-bordered w-full mb-4"
          placeholder="Course name"
          value={form.courseName}
          onChange={(e) =>
            setForm({ ...form, courseName: e.target.value })
          }
          disabled={isSubmitting}
        />

        {/* Description */}
        <textarea
          className="textarea textarea-bordered w-full mb-4"
          placeholder="Course description"
          rows={3}
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          disabled={isSubmitting}
        />

        {/* Category */}
        <input
          className="input input-bordered w-full mb-4"
          placeholder="Category (e.g. Frontend)"
          value={form.categoryName}
          onChange={(e) =>
            setForm({ ...form, categoryName: e.target.value })
          }
          disabled={isSubmitting}
        />

        {/* Instructor */}
        <input
          className="input input-bordered w-full mb-6"
          placeholder="Instructor (e.g. Christine)"
          value={form.instructor}
          onChange={(e) =>
            setForm({ ...form, instructor: e.target.value })
          }
          disabled={isSubmitting}
        />

        {/* Level */}
        <select
          className="select select-bordered w-full mb-6"
          value={form.level}
          onChange={(e) =>
            setForm({
              ...form,
              level: e.target.value as CourseLevel,
            })
          }
          disabled={isSubmitting}
        >
          <option value="EASY">Easy</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>

        {/* Actions */}
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            disabled={isSubmitting}
            onClick={async () => {
              try {
                setIsSubmitting(true);
                await onSubmit(form);
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting && (
              <span className="loading loading-spinner loading-xs mr-2" />
            )}
            {mode === "create" ? "Create" : "Save"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
