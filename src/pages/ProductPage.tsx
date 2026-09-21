import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BatchDrawResultModal, { type BatchDrawResult } from "../components/BatchDrawResultModal";
import ConfirmModal from "../components/ConfirmModal";
import CoverBlock from "../components/CoverBlock";
import Icon from "../components/Icon";
import InfoModal from "../components/InfoModal";
import PrizeGrid from "../components/PrizeGrid";
import { useAuth } from "../context/AuthContext";
import { decorateApiPrizes, PRODUCTS, TIER_ORDER } from "../data/mockData";
import { fuzzyMatch } from "../lib/fuzzySearch";
import * as api from "../lib/api";
import type { Prize } from "../types";

type TabKey = "info" | "guide";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = PRODUCTS.find((p) => p.id === id);
  const [tab, setTab] = useState<TabKey>("info");
  const { user, setUser } = useAuth();
  const [drawError, setDrawError] = useState<string | null>(null);

  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [prizesLoading, setPrizesLoading] = useState(true);
  const [prizeSearch, setPrizeSearch] = useState("");
  const [prizeTierFilter, setPrizeTierFilter] = useState("all");

  const prizesSectionRef = useRef<HTMLDivElement>(null);
  const ticketSectionRef = useRef<HTMLDivElement>(null);
  const [selectedTickets, setSelectedTickets] = useState<Set<number>>(new Set());
  const [takenTickets, setTakenTickets] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isBatchDrawing, setIsBatchDrawing] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchDrawResult | null>(null);

  const filteredPrizes = useMemo(() => {
    return prizes.filter((p) => {
      if (prizeTierFilter !== "all" && p.tier !== prizeTierFilter) return false;
      if (!fuzzyMatch(p.name, prizeSearch)) return false;
      return true;
    });
  }, [prizes, prizeSearch, prizeTierFilter]);

  const remainingDraws = prizes
    .filter((p) => !p.isLastPrize)
    .reduce((sum, p) => sum + p.remainingCount, 0);
  const totalDraws = prizes
    .filter((p) => !p.isLastPrize)
    .reduce((sum, p) => sum + p.totalCount, 0);
  const isSoldOut = !prizesLoading && remainingDraws === 0;

  const loadPrizes = useCallback(async (productId: string) => {
    setPrizesLoading(true);
    try {
      const apiPrizes = await api.fetchProductPrizes(productId);
      setPrizes(decorateApiPrizes(apiPrizes));
    } catch {
      setPrizes([]);
    } finally {
      setPrizesLoading(false);
    }
  }, []);

  const loadTakenSlots = useCallback(async (productId: string) => {
    try {
      const result = await api.fetchTakenSlots(productId);
      const taken = new Set(result.taken);
      setTakenTickets(taken);
      return taken;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (product) {
      loadPrizes(product.id);
      loadTakenSlots(product.id);
    }
  }, [product, loadPrizes, loadTakenSlots]);

  const scrollToTickets = () => {
    if (product) {
      void loadPrizes(product.id);
      void loadTakenSlots(product.id);
    }
    ticketSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToPrizes = () => {
    prizesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleTicket = (num: number) => {
    setSelectedTickets((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const handleRandomPick = () => {
    const pickable = Array.from({ length: totalDraws }, (_, i) => i + 1).filter(
      (n) => !takenTickets.has(n) && !selectedTickets.has(n),
    );
    if (pickable.length === 0) return;
    const pick = pickable[Math.floor(Math.random() * pickable.length)];
    setSelectedTickets((prev) => new Set(prev).add(pick));
  };

  const handleSelectAllRemaining = () => {
    const available = Array.from({ length: totalDraws }, (_, i) => i + 1).filter(
      (n) => !takenTickets.has(n),
    );
    const alreadyAllSelected =
      available.length > 0 &&
      selectedTickets.size === available.length &&
      available.every((n) => selectedTickets.has(n));
    setSelectedTickets(alreadyAllSelected ? new Set() : new Set(available));
  };

  const handleClearSelection = () => {
    setSelectedTickets(new Set());
  };

  const handleRefreshTickets = () => {
    if (!product) return;
    void loadPrizes(product.id);
    void loadTakenSlots(product.id);
  };

  const handleOpenConfirm = () => {
    if (selectedTickets.size === 0) return;
    if (!user) {
      setDrawError("請先登入才能抽獎");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmBatchDraw = async () => {
    if (!product) return;
    const orderedSelection = Array.from(selectedTickets).sort((a, b) => a - b);
    setConfirmOpen(false);
    setIsBatchDrawing(true);
    setDrawError(null);

    try {
      const result = await api.drawProductBatch(product.id, orderedSelection);
      setUser((prev) => (prev ? { ...prev, points: result.points } : prev));
      setSelectedTickets(new Set());
      setBatchResult({
        prizes: result.prizes,
        bonusPrizes: result.bonus_prize ? [result.bonus_prize] : [],
      });
    } catch (err) {
      setDrawError(err instanceof Error ? err.message : "抽獎失敗，請稍後再試");
    }

    const [, taken] = await Promise.all([loadPrizes(product.id), loadTakenSlots(product.id)]);
    if (taken) {
      setSelectedTickets((prev) => new Set(Array.from(prev).filter((n) => !taken.has(n))));
    }
    setIsBatchDrawing(false);
  };

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-bold text-gray-500">找不到這個商品</p>
        <Link to="/" className="mt-4 inline-block text-brand-price underline">
          回到首頁
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-4 text-sm text-gray-400">
        <Link to="/" className="hover:text-brand-price">
          一番賞
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-600">{product.category}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            <CoverBlock
              gradient={product.coverGradient}
              icon={product.icon}
              className="h-full w-full"
              iconClassName="h-20 w-20"
            />
            {isSoldOut && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="rounded border-4 border-white px-4 py-2 text-xl font-black text-white">
                  完售
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-brand-ink ring-1 ring-black/5 w-fit">
            IchibanGo <span className="text-amber-400">★</span> 4.9
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h1 className="text-xl font-black text-brand-ink sm:text-2xl">
            {product.title}
          </h1>

          <div className="flex gap-1 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setTab("info")}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-bold transition-colors ${
                tab === "info"
                  ? "border-brand-price text-brand-price"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              商品說明
            </button>
            <button
              type="button"
              onClick={scrollToPrizes}
              className="-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-bold text-gray-400 transition-colors hover:text-gray-600"
            >
              賞品一覽
            </button>
            <button
              type="button"
              onClick={() => setTab("guide")}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-bold transition-colors ${
                tab === "guide"
                  ? "border-brand-price text-brand-price"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              新手教學
            </button>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-baseline gap-2">
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {product.originalPrice}
                </span>
              )}
              <span className="text-4xl font-black text-brand-price">
                {product.price}
              </span>
              <span className="text-sm text-gray-400">🪙 / 抽</span>
            </div>
            <span className="text-sm text-gray-500">
              剩餘抽數：
              <span className="font-bold text-brand-ink">
                {prizesLoading ? "…" : remainingDraws}
              </span>{" "}
              抽
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={isSoldOut || prizesLoading}
              onClick={scrollToTickets}
              className="flex-1 rounded-xl bg-brand-yellow py-3.5 text-lg font-black text-brand-ink transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:scale-100"
            >
              {isSoldOut ? "已完售" : prizesLoading ? "載入中…" : "開 抽"}
            </button>
            <button
              type="button"
              className="rounded-xl border border-gray-200 px-6 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              抽獎狀況
            </button>
          </div>

          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="mr-2 rounded bg-amber-200 px-1.5 py-0.5 text-xs font-bold">
              {product.status}
            </span>
            依訂單順序陸續出貨，實際到貨日以官方公告為準。
          </div>

          <div className="flex flex-col gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 ring-1 ring-black/5">
              📅 銷售期間　{product.saleStart} ~ {product.saleEnd}
            </div>
            <div className="rounded-lg bg-white px-4 py-3 ring-1 ring-black/5">
              💬 {product.description}
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10">
        {tab === "info" && (
          <div className="rounded-xl bg-white p-6 text-sm leading-7 text-gray-600 ring-1 ring-black/5">
            <h3 className="mb-2 text-base font-black text-brand-ink">
              商品說明
            </h3>
            <p>{product.description}</p>
            <p className="mt-2">
              本商品為原創企劃，非官方授權商品，圖片與名稱僅供展示頁面呈現使用。
            </p>
          </div>
        )}

        {tab === "guide" && (
          <div className="rounded-xl bg-white p-6 text-sm leading-7 text-gray-600 ring-1 ring-black/5">
            <h3 className="mb-2 text-base font-black text-brand-ink">
              新手教學
            </h3>
            <ol className="list-decimal space-y-1 pl-5">
              <li>儲值點數後，於商品頁點擊「開抽」選擇想要的籤號即可進行抽獎。</li>
              <li>抽中的獎項會自動存放於「賞品盒」，可累積後一次寄送。</li>
              <li>當某一賞項抽數歸零，畫面會顯示「完售」標示。</li>
              <li>
                <span className="font-bold text-brand-ink">最後賞是加碼贈品，不是取代原本的賞項</span>
                ：抽到最後一抽的人，會同時獲得「該抽原本對應的一般賞項」與「最後賞」兩份獎品。
              </li>
              <li>最後賞抽出後，代表商品已無剩餘抽數，該商品即完售下架。</li>
            </ol>
          </div>
        )}
      </section>

      <section ref={prizesSectionRef} className="mt-10 scroll-mt-20">
        <h3 className="mb-3 text-base font-black text-brand-ink">
          賞品一覽（共 {prizes.length} 種獎項）
        </h3>
        {!prizesLoading && prizes.length > 0 && (
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={prizeSearch}
              onChange={(e) => setPrizeSearch(e.target.value)}
              placeholder="搜尋獎項名稱…"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-price"
            />
            <select
              value={prizeTierFilter}
              onChange={(e) => setPrizeTierFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-price"
            >
              <option value="all">全部賞別</option>
              {TIER_ORDER.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}
        {prizesLoading && prizes.length === 0 ? (
          <p className="text-sm text-gray-400">載入中…</p>
        ) : filteredPrizes.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">沒有符合條件的獎項</p>
        ) : (
          <PrizeGrid prizes={filteredPrizes} />
        )}
      </section>

      <section ref={ticketSectionRef} className="mt-10 scroll-mt-20">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="text-base font-black text-brand-ink">選擇抽獎籤號</h3>
          <button
            type="button"
            disabled={prizesLoading}
            onClick={handleRefreshTickets}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
          >
            <span className={prizesLoading ? "animate-spin" : ""}>🔄</span>
            更新清單
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          點選想抽的籤號（可複選，重複點擊可取消選取），灰色代表已經被抽走。
        </p>

        {prizesLoading && prizes.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">載入中…</p>
        ) : totalDraws === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">這個商品目前沒有可抽的籤號</p>
        ) : (
          <div className="grid grid-cols-8 gap-2 pb-24 sm:grid-cols-10 md:grid-cols-12">
            {Array.from({ length: totalDraws }, (_, i) => i + 1).map((num) => {
              const taken = takenTickets.has(num);
              const selected = selectedTickets.has(num);
              return (
                <button
                  key={num}
                  type="button"
                  disabled={taken}
                  onClick={() => toggleTicket(num)}
                  className={`flex flex-col items-center justify-center gap-0.5 rounded-lg border py-2 text-xs font-bold transition-colors ${
                    taken
                      ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
                      : selected
                        ? "border-brand-yellow bg-brand-yellow text-brand-ink"
                        : "border-gray-200 bg-white text-gray-600 hover:border-brand-price hover:text-brand-price"
                  }`}
                >
                  <Icon name={product.icon} className="h-3.5 w-3.5" />
                  {num}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {!prizesLoading && !isSoldOut && totalDraws > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-sm text-gray-600">
              {selectedTickets.size > 0 ? (
                <>
                  <span className="mr-2 font-bold text-brand-ink">已選擇（{selectedTickets.size}）：</span>
                  {Array.from(selectedTickets)
                    .sort((a, b) => a - b)
                    .map((n) => `#${n}`)
                    .join("、")}
                </>
              ) : (
                <span className="text-gray-400">尚未選擇籤號，可以自己點，或用右邊的按鈕快速選取</span>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={remainingDraws - selectedTickets.size <= 0}
                onClick={handleRandomPick}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
              >
                隨機選號
              </button>
              <button
                type="button"
                disabled={selectedTickets.size === 0}
                onClick={handleClearSelection}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
              >
                取消選號
              </button>
              <button
                type="button"
                disabled={remainingDraws === 0}
                onClick={handleSelectAllRemaining}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
              >
                全部打包
              </button>
              <button
                type="button"
                disabled={selectedTickets.size === 0}
                onClick={handleOpenConfirm}
                className="rounded-xl bg-brand-yellow px-6 py-3 text-sm font-black text-brand-ink transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:scale-100"
              >
                立即開抽
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="確認抽獎"
        body={`剩餘抽數：${remainingDraws} 抽\n本次抽取：${selectedTickets.size} 抽\n共需花費：🪙 ${selectedTickets.size * product.price}`}
        confirmLabel={isBatchDrawing ? "抽獎中…" : "確認抽獎"}
        confirmDisabled={isBatchDrawing}
        onConfirm={() => void handleConfirmBatchDraw()}
        onCancel={() => setConfirmOpen(false)}
      />

      <BatchDrawResultModal result={batchResult} onClose={() => setBatchResult(null)} />

      <InfoModal
        title={drawError ? "無法抽獎" : null}
        body={drawError ?? ""}
        onClose={() => setDrawError(null)}
      />
    </div>
  );
}
