interface InfoModalProps {
  title: string | null;
  body: string;
  onClose: () => void;
}

export default function InfoModal({ title, body, onClose }: InfoModalProps) {
  if (!title) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-lg font-black text-brand-ink">{title}</h3>
        <p className="whitespace-pre-line text-sm leading-7 text-gray-600">{body}</p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-brand-yellow py-3 text-sm font-black text-brand-ink transition-transform hover:scale-[1.01]"
        >
          關閉
        </button>
      </div>
    </div>
  );
}
