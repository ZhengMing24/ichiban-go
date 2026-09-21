import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CategoryTabs from "../components/CategoryTabs";
import ConfirmModal from "../components/ConfirmModal";
import CoverBlock from "../components/CoverBlock";
import InfoModal from "../components/InfoModal";
import { getShopVisual, SHOP_CATEGORY_ORDER } from "../data/mockData";
import { useShopRedeem } from "../hooks/useShopRedeem";
import * as api from "../lib/api";
import type { ShopItem } from "../lib/api";

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("全部");

  const filteredItems = useMemo(
    () => (category === "全部" ? items : items.filter((item) => item.category === category)),
    [items, category],
  );

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.fetchShopItems());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const {
    confirmItem,
    isRedeeming,
    infoMessage,
    successItemName,
    openConfirm,
    handleConfirm,
    closeConfirm,
    clearInfoMessage,
    clearSuccessMessage,
  } = useShopRedeem({
    onSuccess: (item, result) => {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, remaining_count: result.remaining_count } : it)),
      );
    },
    onError: () => void loadItems(),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-xl font-black text-brand-ink">點數商城</h1>
        <Link to="/shop/history" className="text-sm font-bold text-brand-price underline">
          查看兌換紀錄
        </Link>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        用累積的點數直接兌換以下商品，兌換後立即從點數餘額中扣除。
      </p>

      {!loading && items.length > 0 && (
        <div className="mb-4">
          <CategoryTabs categories={SHOP_CATEGORY_ORDER} active={category} onChange={setCategory} />
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-gray-400">載入中…</p>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">目前沒有可兌換的商品</p>
      ) : filteredItems.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">這個分類目前沒有商品</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => {
            const visual = getShopVisual(item.id);
            const soldOut = item.remaining_count <= 0;
            return (
              <Link
                key={item.id}
                to={`/shop/${item.id}`}
                className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-black/5 transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square">
                  {item.category && (
                    <span className="absolute left-2 top-2 z-10 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-bold text-white">
                      {item.category}
                    </span>
                  )}
                  <CoverBlock
                    gradient={visual.gradient}
                    icon={visual.icon}
                    className="h-full w-full"
                    iconClassName="h-10 w-10"
                  />
                  {soldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="rounded border-2 border-white px-2 py-1 text-xs font-black text-white">
                        已兌換完畢
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <p className="line-clamp-2 min-h-10 text-sm font-bold text-brand-ink">
                    {item.name}
                  </p>
                  <p className="line-clamp-2 text-xs text-gray-400">{item.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                    <span className="text-sm font-black text-brand-price">🪙 {item.cost}</span>
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openConfirm(item);
                      }}
                      className="rounded-lg bg-brand-yellow px-3 py-1.5 text-xs font-black text-brand-ink transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:scale-100"
                    >
                      {soldOut ? "已兌換完畢" : "兌換"}
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!confirmItem}
        title="確認兌換"
        body={confirmItem ? `確定要用 ${confirmItem.cost} 點兌換「${confirmItem.name}」嗎？` : ""}
        confirmLabel={isRedeeming ? "兌換中…" : "確定兌換"}
        confirmDisabled={isRedeeming}
        onConfirm={() => void handleConfirm()}
        onCancel={closeConfirm}
      />

      <InfoModal
        title={infoMessage ? "提醒" : null}
        body={infoMessage ?? ""}
        onClose={clearInfoMessage}
      />

      <InfoModal
        title={successItemName ? "兌換成功" : null}
        body={successItemName ? `已成功兌換「${successItemName}」，商品將依訂單順序出貨。` : ""}
        onClose={clearSuccessMessage}
      />
    </div>
  );
}
