import { useEffect, useState } from "react";
import type { Lecture } from "../../types/course";

interface LectureFormModalProps {
  open: boolean;
  initialData?: Lecture; // present = edit, absent = create
  onSubmit: (payload: Partial<Lecture>) => Promise<void>;
  onClose: () => void;
}

export default function LectureFormModal({
  open,
  initialData,
  onSubmit,
  onClose,
}: LectureFormModalProps) {
  const isEdit = !!initialData;

  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form when modal opens or lecture changes
  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title??"",
        description: initialData.description ?? "",
      });
    } else {
      setForm({
        title: "",
        description: "",
      });
    }
  }, [initialData, open]);
  console.log("lecture:", form)

  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {isEdit ? "Edit lecture" : "Create lecture"}
        </h3>

        {/* Lecture title */}
        <input
          className="input input-bordered w-full mb-4"
          placeholder="Lecture title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          disabled={isSubmitting}
        />

        {/* Description */}
        <textarea
          className="textarea textarea-bordered w-full mb-4"
          placeholder="Lecture description (optional)"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          disabled={isSubmitting}
        />

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
            disabled={isSubmitting || !form.title.trim()}
            onClick={async () => {
              try {
                setIsSubmitting(true);
                await onSubmit({
                  title: form.title?.trim()||"",
                  description: form.description.trim() || undefined,
                });
                onClose();
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting && (
              <span className="loading loading-spinner loading-xs mr-2" />
            )}
            {isEdit ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
