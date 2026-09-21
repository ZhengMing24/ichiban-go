import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import InfoModal from "../components/InfoModal";
import ShippingFormModal from "../components/ShippingFormModal";
import { useAuth } from "../context/AuthContext";
import { getTierColor, PRODUCTS, TIER_ORDER } from "../data/mockData";
import { formatDate } from "../lib/format";
import { fuzzyMatch } from "../lib/fuzzySearch";
import * as api from "../lib/api";
import type { MyPrizeRecord, ShippedPrizeRecord } from "../lib/api";

function productTitle(productId: string) {
  return PRODUCTS.find((p) => p.id === productId)?.title ?? productId;
}

function subtitleFor(r: MyPrizeRecord) {
  return r.source === "draw" ? productTitle(r.product_id) : "點數商城兌換";
}

function rowKey(r: { id: string; source: string }) {
  return `${r.source}:${r.id}`;
}

const SHIPPING_RULES_TEXT = `運費採計重方式收費（僅供參考，實際以出貨時包裝重量為準）：
・0.5kg 以內：60 元
・0.5kg ~ 1kg：90 元
・每再增加 1kg：加收 40 元

各賞別參考重量（用於估算運費，多件商品會合併包裝計重以節省運費）：
・A賞／最後賞（大型公仔、模型類）：約 1.2kg
・B賞（模型、場景類）：約 0.8kg
・C賞（壓克力立牌）：約 0.3kg
・D賞（徽章／鑰匙圈）：約 0.1kg
・E賞（絨毛玩偶／小物）：約 0.2kg

實際運費將於實際包裝、秤重後核算，若與上述估算有落差，將以出貨通知為準；偏遠地區或超size商品可能酌收額外費用。`;

type BoxTab = "box" | "shipped";

export default function PrizeBoxPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<BoxTab>("box");

  const [records, setRecords] = useState<MyPrizeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [shippingOpen, setShippingOpen] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [isShipping, setIsShipping] = useState(false);
  const [shippingRulesOpen, setShippingRulesOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [shippedRecords, setShippedRecords] = useState<ShippedPrizeRecord[]>([]);
  const [shippedLoading, setShippedLoading] = useState(true);
  const [shipDateFrom, setShipDateFrom] = useState("");
  const [shipDateTo, setShipDateTo] = useState("");

  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

  const loadBox = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .fetchMyPrizes()
      .then(setRecords)
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [user]);

  const loadShipped = useCallback(() => {
    if (!user) {
      setShippedLoading(false);
      return;
    }
    setShippedLoading(true);
    api
      .fetchShippedPrizes()
      .then(setShippedRecords)
      .catch(() => setShippedRecords([]))
      .finally(() => setShippedLoading(false));
  }, [user]);

  useEffect(() => loadBox(), [loadBox]);
  useEffect(() => loadShipped(), [loadShipped]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (tierFilter !== "all" && r.tier !== tierFilter) return false;
      if (!fuzzyMatch(r.name, search) && !fuzzyMatch(subtitleFor(r), search)) {
        return false;
      }
      return true;
    });
  }, [records, search, tierFilter]);

  const filteredShippedRecords = useMemo(() => {
    return shippedRecords.filter((r) => {
      if (tierFilter !== "all" && r.tier !== tierFilter) return false;
      if (!fuzzyMatch(r.name, search) && !fuzzyMatch(subtitleFor(r), search)) {
        return false;
      }
      const shippedDate = r.shipped_at.slice(0, 10);
      if (shipDateFrom && shippedDate < shipDateFrom) return false;
      if (shipDateTo && shippedDate > shipDateTo) return false;
      return true;
    });
  }, [shippedRecords, search, tierFilter, shipDateFrom, shipDateTo]);

  const allVisibleSelected =
    filteredRecords.length > 0 && filteredRecords.every((r) => selectedIds.has(rowKey(r)));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        filteredRecords.forEach((r) => next.delete(rowKey(r)));
        return next;
      }
      const next = new Set(prev);
      filteredRecords.forEach((r) => next.add(rowKey(r)));
      return next;
    });
  };

  const toggleSelect = (key: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleShip = async (input: { recipientName: string; phone: string; address: string; note: string }) => {
    setShippingError(null);
    setIsShipping(true);
    try {
      const selectedRecords = records.filter((r) => selectedIds.has(rowKey(r)));
      await api.createShipment({
        items: selectedRecords.map((r) => ({ id: r.id, source: r.source })),
        recipientName: input.recipientName,
        phone: input.phone,
        address: input.address,
        note: input.note,
      });
      setRecords((prev) => prev.filter((r) => !selectedIds.has(rowKey(r))));
      setSelectedIds(new Set());
      setShippingOpen(false);
      setSuccessMessage("商品已送出寄送申請！");
      loadShipped();
    } catch (err) {
      setShippingError(err instanceof Error ? err.message : "寄送申請失敗，請稍後再試");
      loadBox();
    } finally {
      setIsShipping(false);
    }
  };

  const tabButtonClass = (t: BoxTab) =>
    `rounded-full px-4 py-2 text-sm font-bold transition-colors ${
      tab === t ? "bg-brand-ink text-white" : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-black text-brand-ink">賞品盒</h1>
        <button
          type="button"
          onClick={() => setShippingRulesOpen(true)}
          className="text-sm font-bold text-brand-price underline"
        >
          商品運送規則
        </button>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        你抽中的所有獎項都會存放在這裡，累積後可勾選商品申請一次出貨。
      </p>

      <div className="mb-4 flex gap-1 rounded-full bg-gray-100 p-1 w-fit">
        <button type="button" onClick={() => setTab("box")} className={tabButtonClass("box")}>
          未寄送
        </button>
        <button type="button" onClick={() => setTab("shipped")} className={tabButtonClass("shipped")}>
          已兌換
        </button>
      </div>

      {!user && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-16 text-gray-400 ring-1 ring-black/5">
          <span className="text-4xl">🔒</span>
          <p>請先登入查看你的賞品盒</p>
        </div>
      )}

      {user && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋賞品名稱或商品…"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-price"
          />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-price"
          >
            <option value="all">全部賞別</option>
            {TIER_ORDER.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {tab === "shipped" && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={shipDateFrom}
                onChange={(e) => setShipDateFrom(e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-2 text-sm text-brand-ink outline-none focus:border-brand-price"
              />
              <span className="text-gray-400">～</span>
              <input
                type="date"
                value={shipDateTo}
                onChange={(e) => setShipDateTo(e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-2 text-sm text-brand-ink outline-none focus:border-brand-price"
              />
            </div>
          )}
        </div>
      )}

      {user && tab === "box" && (
        <>
          {!loading && records.length > 0 && (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-black/5">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 accent-brand-price"
                />
                全選
                {selectedIds.size > 0 && (
                  <span className="font-normal text-gray-400">（已選 {selectedIds.size} 項）</span>
                )}
              </label>
              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={() => setShippingOpen(true)}
                className="rounded-lg bg-brand-yellow px-4 py-2 text-sm font-black text-brand-ink transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:scale-100"
              >
                商品寄送
              </button>
            </div>
          )}

          {loading && <p className="py-10 text-center text-sm text-gray-400">載入中…</p>}

          {!loading && records.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-16 text-gray-400 ring-1 ring-black/5">
              <span className="text-4xl">🎁</span>
              <p>目前還沒有任何賞品，快去抽一抽吧！</p>
              <Link to="/" className="mt-2 text-sm font-bold text-brand-price underline">
                回到首頁逛逛
              </Link>
            </div>
          )}

          {!loading && records.length > 0 && filteredRecords.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-16 text-gray-400 ring-1 ring-black/5">
              <span className="text-4xl">🔍</span>
              <p>沒有符合條件的賞品</p>
            </div>
          )}

          {!loading && filteredRecords.length > 0 && (
            <ul className="flex flex-col gap-3">
              {filteredRecords.map((r) => (
                <li
                  key={rowKey(r)}
                  className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-black/5"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rowKey(r))}
                    onChange={() => toggleSelect(rowKey(r))}
                    className="h-4 w-4 shrink-0 accent-brand-price"
                  />
                  {r.source === "draw" ? (
                    <span
                      className="shrink-0 rounded-md px-2 py-1 text-xs font-black text-white"
                      style={{ backgroundColor: getTierColor(r.tier) }}
                    >
                      {r.tier}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md bg-slate-600 px-2 py-1 text-xs font-black text-white">
                      {r.category || "商城"}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-brand-ink">{r.name}</p>
                    <p className="truncate text-xs text-gray-400">{subtitleFor(r)}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-gray-400">
                    {r.is_bonus && (
                      <span className="mb-1 block rounded bg-amber-100 px-1.5 py-0.5 font-bold text-amber-600">
                        加碼贈送
                      </span>
                    )}
                    {formatDate(r.created_at)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {user && tab === "shipped" && (
        <>
          {shippedLoading && <p className="py-10 text-center text-sm text-gray-400">載入中…</p>}

          {!shippedLoading && shippedRecords.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-16 text-gray-400 ring-1 ring-black/5">
              <span className="text-4xl">📦</span>
              <p>目前還沒有已寄送的商品</p>
            </div>
          )}

          {!shippedLoading && shippedRecords.length > 0 && filteredShippedRecords.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-16 text-gray-400 ring-1 ring-black/5">
              <span className="text-4xl">🔍</span>
              <p>沒有符合條件的賞品</p>
            </div>
          )}

          {!shippedLoading && filteredShippedRecords.length > 0 && (
            <ul className="flex flex-col gap-3">
              {filteredShippedRecords.map((r) => (
                <li
                  key={rowKey(r)}
                  className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-black/5"
                >
                  {r.source === "draw" ? (
                    <span
                      className="shrink-0 rounded-md px-2 py-1 text-xs font-black text-white"
                      style={{ backgroundColor: getTierColor(r.tier) }}
                    >
                      {r.tier}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md bg-slate-600 px-2 py-1 text-xs font-black text-white">
                      {r.category || "商城"}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-brand-ink">{r.name}</p>
                    <p className="truncate text-xs text-gray-400">{subtitleFor(r)}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-gray-400">
                    <p className="mb-1 font-bold text-emerald-600">已寄送</p>
                    訂單成立時間 {formatDate(r.shipped_at)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <ShippingFormModal
        open={shippingOpen}
        itemCount={selectedIds.size}
        isSubmitting={isShipping}
        error={shippingError}
        onSubmit={(input) => void handleShip(input)}
        onClose={() => {
          if (isShipping) return;
          setShippingOpen(false);
          setShippingError(null);
        }}
      />

      <InfoModal
        title={shippingRulesOpen ? "商品運送規則" : null}
        body={SHIPPING_RULES_TEXT}
        onClose={() => setShippingRulesOpen(false)}
      />

      <InfoModal
        title={successMessage ? "寄送成功" : null}
        body={successMessage ?? ""}
        onClose={() => setSuccessMessage(null)}
      />
    </div>
  );
}
