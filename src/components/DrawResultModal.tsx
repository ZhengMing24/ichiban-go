interface DrawResultModalProps {
  prize: { id: string; name: string } | null;
  bonusPrize?: { id: string; name: string } | null;
  onClose: () => void;
}

export default function DrawResultModal({ prize, bonusPrize, onClose }: DrawResultModalProps) {
  if (!prize) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-bold text-gray-400">恭喜抽中</p>
        <p className="mt-2 text-2xl font-black text-brand-ink">{prize.name}</p>

        {bonusPrize && (
          <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3">
            <p className="text-xs font-bold text-amber-600">🎉 最後一抽加碼贈送</p>
            <p className="mt-1 text-lg font-black text-brand-ink">{bonusPrize.name}</p>
          </div>
        )}

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
