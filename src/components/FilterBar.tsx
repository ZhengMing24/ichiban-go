export type SortOption = "recommended" | "price-asc" | "price-desc" | "newest";

const SORT_LABELS: Record<SortOption, string> = {
  recommended: "推薦排序",
  "price-asc": "價格低到高",
  "price-desc": "價格高到低",
  newest: "最新上架",
};

interface FilterBarProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  total: number;
}

export default function FilterBar({ sort, onSortChange, total }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-black/5">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>🔍 篩選</span>
        <span className="hidden text-gray-300 sm:inline">|</span>
        <label className="hidden items-center gap-2 sm:flex">
          排序
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm font-bold text-brand-ink"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <span className="text-sm text-gray-500">
        總計商品數：<span className="font-bold text-brand-ink">{total}</span>
      </span>
    </div>
  );
}
