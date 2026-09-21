interface CategoryTabsProps<T extends string> {
  categories: T[];
  active: T | "全部";
  onChange: (category: T | "全部") => void;
}

export default function CategoryTabs<T extends string>({
  categories,
  active,
  onChange,
}: CategoryTabsProps<T>) {
  const allTabs: (T | "全部")[] = ["全部", ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {allTabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
            active === tab
              ? "bg-brand-yellow text-brand-ink"
              : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
