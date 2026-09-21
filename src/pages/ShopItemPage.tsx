import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import CoverBlock from "../components/CoverBlock";
import InfoModal from "../components/InfoModal";
import { getShopVisual } from "../data/mockData";
import { useShopRedeem } from "../hooks/useShopRedeem";
import * as api from "../lib/api";
import type { ShopItem } from "../lib/api";

export default function ShopItemPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ShopItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadItem = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    try {
      setItem(await api.fetchShopItem(id));
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadItem();
  }, [loadItem]);

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
    onSuccess: (redeemedItem, result) => {
      setItem((prev) =>
        prev && prev.id === redeemedItem.id ? { ...prev, remaining_count: result.remaining_count } : prev,
      );
    },
    onError: () => void loadItem(),
  });

  if (loading) {
    return <p className="py-16 text-center text-sm text-gray-400">載入中…</p>;
  }

  if (notFound || !item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-bold text-gray-500">找不到這個商品</p>
        <Link to="/shop" className="mt-4 inline-block text-brand-price underline">
          回到商城
        </Link>
      </div>
    );
  }

  const visual = getShopVisual(item.id);
  const soldOut = item.remaining_count <= 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <nav className="mb-4 text-sm text-gray-400">
        <Link to="/shop" className="hover:text-brand-price">
          點數商城
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-600">{item.name}</span>
      </nav>

      <div className="grid gap-8 sm:grid-cols-[320px_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-2xl">
          <CoverBlock
            gradient={visual.gradient}
            icon={visual.icon}
            className="h-full w-full"
            iconClassName="h-16 w-16"
          />
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded border-4 border-white px-4 py-2 text-xl font-black text-white">
                已兌換完畢
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {item.category && (
            <span className="w-fit rounded-md bg-brand-ink px-2 py-1 text-xs font-bold text-white">
              {item.category}
            </span>
          )}
          <h1 className="text-xl font-black text-brand-ink sm:text-2xl">{item.name}</h1>

          <div className="rounded-lg bg-white px-4 py-3 text-sm leading-7 text-gray-600 ring-1 ring-black/5">
            {item.description}
          </div>

          <span className="text-3xl font-black text-brand-price">🪙 {item.cost}</span>

          <button
            type="button"
            disabled={soldOut}
            onClick={() => openConfirm(item)}
            className="rounded-xl bg-brand-yellow py-3.5 text-lg font-black text-brand-ink transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:scale-100"
          >
            {soldOut ? "已兌換完畢" : "立即兌換"}
          </button>
        </div>
      </div>

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
