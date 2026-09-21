import { useEffect, useState } from "react";
import * as api from "../lib/api";
import type { ProductStock } from "../lib/api";

export function useProductStocks() {
  const [stocks, setStocks] = useState<Record<string, ProductStock>>({});

  useEffect(() => {
    let cancelled = false;
    api
      .fetchProductStocks()
      .then((list) => {
        if (cancelled) return;
        const map: Record<string, ProductStock> = {};
        for (const s of list) map[s.id] = s;
        setStocks(map);
      })
      .catch(() => {
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return stocks;
}
