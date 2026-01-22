interface ConfirmDangerModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export default function ConfirmDangerModal({
  open,
  title,
  description,
  confirmText = "Delete",
  onConfirm,
  onClose,
}: ConfirmDangerModalProps) {
  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box border border-error">
        <h3 className="font-bold text-lg text-error mb-2">
          {title}
        </h3>

        <p className="text-base-content/70 mb-6">
          {description}
        </p>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-error"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
}
