import type { Prize } from "../types";
import CoverBlock from "./CoverBlock";

export default function PrizeCard({ prize }: { prize: Prize }) {
  const isSoldOut = prize.remainingCount === 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
      <div className="relative aspect-square">
        <CoverBlock
          gradient={prize.coverGradient}
          icon={prize.icon}
          className="h-full w-full"
          iconClassName="h-8 w-8"
        />
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded border-2 border-white px-2 py-0.5 text-xs font-black text-white">
              完售
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 min-h-10 text-sm font-bold text-brand-ink">
          {prize.name}
        </p>
        <span
          className="w-fit rounded-md px-2 py-1 text-xs font-black text-white"
          style={{ backgroundColor: prize.tierColor }}
        >
          {prize.tier}：{prize.remainingCount}/{prize.totalCount}
        </span>
      </div>
    </div>
  );
}
