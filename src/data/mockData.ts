import type { Category, Prize, Product } from "../types";
import type { IconName } from "../components/Icon";
import type { ApiPrize, ProductStock } from "../lib/api";

export const CATEGORIES: Category[] = [
  "一番賞",
  "自製賞",
  "3C賞",
  "刮刮樂",
  "生活",
  "卡牌",
];

export const PRODUCTS: Product[] = [
  {
    id: "frieren-journey-1",
    title: "日版 一番賞《葬送的芙莉蓮》魔法使的旅途 Vol.1",
    category: "一番賞",
    coverGradient: "from-emerald-500 via-teal-400 to-cyan-300",
    icon: "wand",
    price: 400,
    totalCount: 80,
    remainingCount: 34,
    status: "現貨",
    isNew: true,
    saleStart: "2026-08-20",
    saleEnd: "2026-10-31",
    description:
      "《葬送的芙莉蓮》最新一番賞，收錄芙莉蓮、欣梅爾等人氣角色造型公仔與周邊小物，最後賞為限定紀念場景模型。",
  },
  {
    id: "hunterxhunter-greed-island",
    title: "日版 一番賞《HUNTER×HUNTER 獵人》貪婪之島篇",
    category: "一番賞",
    coverGradient: "from-green-700 via-lime-500 to-yellow-400",
    icon: "compass",
    price: 420,
    totalCount: 81,
    remainingCount: 19,
    status: "現貨",
    isHot: true,
    saleStart: "2026-07-10",
    saleEnd: "2026-10-05",
    description:
      "《獵人》貪婪之島篇一番賞，A賞為奇犽 1/7 手辦，最後賞為全員紀念場景模型。",
  },
  {
    id: "onepiece-wano-1",
    title: "日版 一番賞《航海王 ONE PIECE》和之國篇",
    category: "一番賞",
    coverGradient: "from-red-600 via-orange-500 to-yellow-400",
    icon: "anchor",
    price: 380,
    totalCount: 70,
    remainingCount: 52,
    status: "現貨",
    saleStart: "2026-09-20",
    saleEnd: "2026-12-01",
    description:
      "《航海王》和之國篇一番賞，收錄魯夫五檔、索隆三刀流等人氣造型手辦與周邊。",
  },
  {
    id: "deep-sea-tank-2",
    title: "原創一番賞《深海水族箱》#2",
    category: "自製賞",
    coverGradient: "from-teal-500 via-cyan-500 to-blue-600",
    icon: "waves",
    price: 280,
    totalCount: 50,
    remainingCount: 12,
    status: "現貨",
    saleStart: "2026-08-01",
    saleEnd: "2026-10-20",
    description: "手繪深海生物系列，收錄絨毛玩偶、鑰匙圈與透明壓克力吊飾。",
  },
  {
    id: "iphone-16-pro-max",
    title: "3C賞《iPhone 16 Pro Max 現貨直抽》",
    category: "3C賞",
    coverGradient: "from-gray-800 via-gray-600 to-gray-400",
    icon: "smartphone",
    price: 500,
    totalCount: 30,
    remainingCount: 3,
    status: "現貨",
    isHot: true,
    saleStart: "2026-08-15",
    saleEnd: "2026-10-15",
    description: "電子產品抽獎賞，A賞為 iPhone 16 Pro Max 1TB，另有 AirPods、行動電源等獎項。",
  },
  {
    id: "scratch-lucky-star",
    title: "刮刮樂《幸運星塵》即刮即中",
    category: "刮刮樂",
    coverGradient: "from-yellow-400 via-amber-400 to-orange-400",
    icon: "sparkles",
    price: 100,
    totalCount: 200,
    remainingCount: 88,
    status: "現貨",
    saleStart: "2026-09-01",
    saleEnd: "2026-12-31",
    description: "低單價刮刮樂，每抽必中小獎，滿額有機會刮中特別大獎。",
  },
  {
    id: "cozy-room-living",
    title: "生活雜貨賞《質感小窩》",
    category: "生活",
    coverGradient: "from-rose-300 via-orange-200 to-amber-200",
    icon: "sofa",
    price: 220,
    totalCount: 45,
    remainingCount: 45,
    status: "預購",
    isNew: true,
    saleStart: "2026-09-25",
    saleEnd: "2026-11-30",
    description: "居家雜貨系列一番賞，收錄香氛蠟燭、毛毯與陶瓷杯盤組。",
  },
  {
    id: "trading-card-arcane",
    title: "原創卡牌賞《秘術學院》booster",
    category: "卡牌",
    coverGradient: "from-violet-600 via-purple-500 to-indigo-500",
    icon: "cards",
    price: 180,
    totalCount: 100,
    remainingCount: 33,
    status: "現貨",
    saleStart: "2026-08-05",
    saleEnd: "2026-11-05",
    description: "原創對戰卡牌系列，每抽保底一張稀有卡，收錄隱藏閃卡機率。",
  },
  {
    id: "onepiece-summit-last",
    title: "日版 最後賞直接抽！航海王 ONE PIECE -頂上決戰-",
    category: "一番賞",
    coverGradient: "from-blue-700 via-indigo-600 to-red-500",
    icon: "skull",
    price: 480,
    originalPrice: 520,
    totalCount: 60,
    remainingCount: 60,
    status: "現貨",
    isHot: true,
    saleStart: "2026-06-01",
    saleEnd: "2026-09-30",
    description: "上一彈最後賞直接抽，售完即結束，限量絕版收藏品。",
  },
  {
    id: "jujutsukaisen-shibuya",
    title: "日版 一番賞《咒術迴戰》澀谷事變篇",
    category: "一番賞",
    coverGradient: "from-purple-700 via-indigo-600 to-slate-800",
    icon: "vortex",
    price: 400,
    totalCount: 81,
    remainingCount: 41,
    status: "預購",
    isNew: true,
    saleStart: "2026-10-01",
    saleEnd: "2026-12-15",
    description: "《咒術迴戰》澀谷事變篇一番賞，A賞為五條悟 1/7 手辦，預購享優先出貨。",
  },
  {
    id: "demonslayer-hashira",
    title: "日版 一番賞《鬼滅之刃》柱稽古篇",
    category: "一番賞",
    coverGradient: "from-rose-600 via-pink-500 to-teal-400",
    icon: "flame",
    price: 380,
    originalPrice: 420,
    totalCount: 75,
    remainingCount: 8,
    status: "現貨",
    isHot: true,
    saleStart: "2026-05-01",
    saleEnd: "2026-09-10",
    description: "《鬼滅之刃》柱稽古篇一番賞，收錄炭治郎、義勇等柱與鬼殺隊角色手辦。",
  },
  {
    id: "spyxfamily-mission",
    title: "日版 一番賞《SPY×FAMILY 間諜家家酒》任務日常",
    category: "一番賞",
    coverGradient: "from-sky-400 via-indigo-300 to-pink-300",
    icon: "glasses",
    price: 320,
    totalCount: 60,
    remainingCount: 60,
    status: "預購",
    isNew: true,
    saleStart: "2026-10-05",
    saleEnd: "2026-12-20",
    description: "佛傑一家日常主題一番賞，預購享優先出貨與限定貼紙加贈。",
  },
];

const tierVisuals: Record<string, { color: string; gradient: string; icon: IconName }> = {
  "A賞": { color: "var(--color-tier-a)", gradient: "from-rose-400 to-orange-300", icon: "trophy" },
  "B賞": { color: "var(--color-tier-b)", gradient: "from-amber-400 to-yellow-300", icon: "gift" },
  "C賞": { color: "var(--color-tier-c)", gradient: "from-sky-400 to-cyan-300", icon: "frame" },
  "D賞": { color: "var(--color-tier-d)", gradient: "from-teal-400 to-emerald-300", icon: "key" },
  "E賞": { color: "var(--color-tier-e)", gradient: "from-violet-400 to-purple-300", icon: "ribbon" },
  "最後賞": { color: "var(--color-tier-last)", gradient: "from-zinc-700 to-zinc-500", icon: "crown" },
};

export function applyRealStock(
  products: Product[],
  stocks: Record<string, ProductStock>,
): Product[] {
  return products.map((p) => {
    const stock = stocks[p.id];
    if (!stock) return p;
    return { ...p, remainingCount: stock.remaining_count, totalCount: stock.total_count };
  });
}

export const TIER_ORDER = Object.keys(tierVisuals);

export const SHOP_CATEGORY_ORDER = ["生活雜貨", "周邊小物", "3C", "兌換券"];

const shopVisuals: { gradient: string; icon: IconName }[] = [
  { gradient: "from-emerald-500 via-teal-400 to-cyan-300", icon: "gift" },
  { gradient: "from-rose-400 to-orange-300", icon: "sparkles" },
  { gradient: "from-sky-400 to-cyan-300", icon: "frame" },
  { gradient: "from-violet-400 to-purple-300", icon: "crown" },
  { gradient: "from-amber-400 to-yellow-300", icon: "cards" },
  { gradient: "from-teal-400 to-emerald-300", icon: "sofa" },
];

export function getShopVisual(itemId: string) {
  let hash = 0;
  for (let i = 0; i < itemId.length; i++) {
    hash = (hash * 31 + itemId.charCodeAt(i)) >>> 0;
  }
  return shopVisuals[hash % shopVisuals.length];
}

export function getTierVisual(tier: string) {
  return tierVisuals[tier] ?? tierVisuals["A賞"];
}

export function getTierColor(tier: string): string {
  return (tierVisuals[tier] ?? tierVisuals["A賞"]).color;
}

export function decorateApiPrizes(apiPrizes: ApiPrize[]): Prize[] {
  return apiPrizes.map((p) => {
    const visual = tierVisuals[p.tier] ?? tierVisuals["A賞"];
    return {
      id: p.id,
      tier: p.tier,
      tierColor: visual.color,
      name: p.name,
      coverGradient: visual.gradient,
      icon: visual.icon,
      totalCount: p.total_count,
      remainingCount: p.remaining_count,
      isLastPrize: p.is_last_prize,
    };
  });
}
