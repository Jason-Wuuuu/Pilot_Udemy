import { useEffect, useState } from "react";
import type { Material } from "../../types/course";

interface MaterialFormModalProps {
  open: boolean;
  initialData?: Material;
  onSubmit: (formData: FormData) => Promise<void>;
  onClose: () => void;
}

export default function MaterialFormModal({
  open,
  initialData,
  onSubmit,
  onClose,
}: MaterialFormModalProps) {
  const isEdit = !!initialData;

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* =========================
     Sync form on open/edit
     ========================= */
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title ?? "");
      setFile(null); // never preload files
    } else {
      setTitle("");
      setFile(null);
    }
  }, [initialData, open]);

  if (!open) return null;

  const canSubmit = title.trim().length > 0 && (isEdit || file);

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        {/* Header */}
        <h3 className="font-bold text-lg mb-1">
          {isEdit ? "Edit material" : "Add material"}
        </h3>

        <p className="text-sm text-base-content/60 mb-5">
          {isEdit
            ? "Update material title or replace the file."
            : "Upload a new file for this lecture."}
        </p>

        {/* Title */}
        <label className="block mb-4">
          <span className="text-sm font-medium mb-1 block">
            Title <span className="text-error">*</span>
          </span>

          <input
            className="input input-bordered w-full"
            placeholder="Material title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
        </label>

        {/* File */}
        <label className="block mb-6">
          <span className="text-sm font-medium mb-1 block">
            {isEdit ? "Replace file (optional)" : "File"}
            {!isEdit && <span className="text-error"> *</span>}
          </span>

          <input
            type="file"
            className="file-input file-input-bordered w-full"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={submitting}
          />

          {isEdit && (
            <p className="text-xs text-base-content/60 mt-1">
              Current file will be kept if no new file is selected.
            </p>
          )}
        </label>

        {/* Actions */}
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            disabled={!canSubmit || submitting}
            onClick={async () => {
              try {
                setSubmitting(true);

                const formData = new FormData();
                formData.append("title", title.trim());
                if (file) formData.append("file", file);

                await onSubmit(formData);
                onClose();
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting && (
              <span className="loading loading-spinner loading-xs mr-2" />
            )}
            {isEdit ? "Save changes" : "Upload material"}
          </button>
        </div>
      </div>
    </div>
  );
}
