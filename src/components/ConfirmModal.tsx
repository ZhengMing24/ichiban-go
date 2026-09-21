interface ConfirmModalProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = "確定",
  cancelLabel = "取消",
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={() => {
        if (!confirmDisabled) onCancel();
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-black text-brand-ink">{title}</h3>
        <p className="whitespace-pre-line text-sm leading-6 text-gray-600">{body}</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={confirmDisabled}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="flex-1 rounded-xl bg-brand-yellow py-3 text-sm font-black text-brand-ink transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:scale-100"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
