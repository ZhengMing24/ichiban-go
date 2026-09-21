import { useCallback, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import type { RedeemResult, ShopItem } from "../lib/api";

interface UseShopRedeemOptions {
  onSuccess?: (item: ShopItem, result: RedeemResult) => void;
  onError?: (item: ShopItem) => void;
}

export function useShopRedeem({ onSuccess, onError }: UseShopRedeemOptions = {}) {
  const { user, setUser } = useAuth();
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [successItemName, setSuccessItemName] = useState<string | null>(null);

  const isRedeemingRef = useRef(false);

  const openConfirm = useCallback(
    (item: ShopItem) => {
      if (isRedeemingRef.current || item.remaining_count <= 0) return;
      if (!user) {
        setInfoMessage("請先登入才能兌換");
        return;
      }
      if (user.points < item.cost) {
        setInfoMessage("點數不足，無法兌換");
        return;
      }
      setConfirmItem(item);
    },
    [user],
  );

  const handleConfirm = useCallback(async () => {
    if (!confirmItem || isRedeemingRef.current) return;
    const item = confirmItem;
    isRedeemingRef.current = true;
    setIsRedeeming(true);
    try {
      const result = await api.redeemShopItem(item.id);
      setUser((prev) => (prev ? { ...prev, points: result.points } : prev));
      setSuccessItemName(result.item.name);
      setConfirmItem(null);
      onSuccess?.(item, result);
    } catch (err) {
      setInfoMessage(err instanceof Error ? err.message : "兌換失敗，請稍後再試");
      setConfirmItem(null);
      onError?.(item);
    } finally {
      isRedeemingRef.current = false;
      setIsRedeeming(false);
    }
  }, [confirmItem, onSuccess, onError, setUser]);

  return {
    confirmItem,
    isRedeeming,
    infoMessage,
    successItemName,
    openConfirm,
    handleConfirm,
    closeConfirm: () => setConfirmItem(null),
    clearInfoMessage: () => setInfoMessage(null),
    clearSuccessMessage: () => setSuccessItemName(null),
  };
}
