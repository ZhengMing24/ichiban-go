import type { IconName } from "../components/Icon";

export type StockStatus = "現貨" | "預購" | "已售完";

export type Category =
  | "一番賞"
  | "自製賞"
  | "3C賞"
  | "刮刮樂"
  | "生活"
  | "卡牌";

export interface Product {
  id: string;
  title: string;
  category: Category;
  coverGradient: string;
  icon: IconName;
  price: number;
  originalPrice?: number;
  totalCount: number;
  remainingCount: number;
  status: StockStatus;
  isHot?: boolean;
  isNew?: boolean;
  saleStart: string;
  saleEnd: string;
  description: string;
}

export interface Prize {
  id: string;
  tier: string;
  tierColor: string;
  name: string;
  coverGradient: string;
  icon: IconName;
  totalCount: number;
  remainingCount: number;
  isLastPrize?: boolean;
}
