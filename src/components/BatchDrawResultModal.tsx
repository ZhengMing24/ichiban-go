export interface BatchDrawResult {
  prizes: { id: string; name: string }[];
  bonusPrizes: { id: string; name: string }[];
}

interface BatchDrawResultModalProps {
  result: BatchDrawResult | null;
  onClose: () => void;
}

export default function BatchDrawResultModal({ result, onClose }: BatchDrawResultModalProps) {
  if (!result) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-bold text-gray-400">恭喜抽中 {result.prizes.length} 項</p>

        <ul className="mt-3 flex flex-col gap-2 text-left">
          {result.prizes.map((p, i) => (
            <li
              key={`${p.id}-${i}`}
              className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-bold text-brand-ink"
            >
              {p.name}
            </li>
          ))}
        </ul>

        {result.bonusPrizes.length > 0 && (
          <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-left">
            <p className="text-xs font-bold text-amber-600">🎉 最後一抽加碼贈送</p>
            {result.bonusPrizes.map((p, i) => (
              <p key={`${p.id}-${i}`} className="mt-1 text-sm font-black text-brand-ink">
                {p.name}
              </p>
            ))}
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
