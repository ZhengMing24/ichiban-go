import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../lib/format";
import * as api from "../lib/api";
import type { ShopRedemptionRecord } from "../lib/api";

export default function ShopHistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<ShopRedemptionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .fetchMyShopRedemptions()
      .then(setRecords)
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <nav className="mb-4 text-sm text-gray-400">
        <Link to="/shop" className="hover:text-brand-price">
          點數商城
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-600">兌換紀錄</span>
      </nav>

      <h1 className="mb-1 text-xl font-black text-brand-ink">我的兌換紀錄</h1>
      <p className="mb-6 text-sm text-gray-500">你在點數商城兌換過的所有商品都會列在這裡。</p>

      {!user && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-16 text-gray-400 ring-1 ring-black/5">
          <span className="text-4xl">🔒</span>
          <p>請先登入查看你的兌換紀錄</p>
        </div>
      )}

      {user && loading && (
        <p className="py-10 text-center text-sm text-gray-400">載入中…</p>
      )}

      {user && !loading && records.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-16 text-gray-400 ring-1 ring-black/5">
          <span className="text-4xl">🧾</span>
          <p>目前還沒有兌換過任何商品</p>
          <Link to="/shop" className="mt-2 text-sm font-bold text-brand-price underline">
            去商城逛逛
          </Link>
        </div>
      )}

      {user && !loading && records.length > 0 && (
        <ul className="flex flex-col gap-3">
          {records.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-black/5"
            >
              <div className="min-w-0 flex-1">
                <Link
                  to={`/shop/${r.shop_item_id}`}
                  className="truncate text-sm font-bold text-brand-ink hover:text-brand-price hover:underline"
                >
                  {r.name}
                </Link>
              </div>
              <div className="shrink-0 text-right text-xs text-gray-400">
                <p className="font-bold text-brand-price">🪙 {r.cost}</p>
                {formatDate(r.created_at)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
