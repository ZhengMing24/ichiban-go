import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ACTIONS = [
  { icon: "🎉", label: "活動", to: "/events" },
  { icon: "💰", label: "儲值", to: "/topup" },
];

export default function SideDock() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-6 right-4 z-30 flex flex-col items-center gap-2">
      {ACTIONS.map((action) => (
        <Link
          key={action.label}
          to={action.to}
          className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-white text-[10px] font-bold text-gray-600 shadow-md ring-1 ring-black/5 hover:text-brand-price"
        >
          <span className="text-base">{action.icon}</span>
          {action.label}
        </Link>
      ))}
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-brand-ink text-[10px] font-bold text-white shadow-md"
        >
          <span className="text-base">↑</span>
          TOP
        </button>
      )}
    </div>
  );
}
