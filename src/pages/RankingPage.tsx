import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CoverBlock from "../components/CoverBlock";
import { getTierVisual } from "../data/mockData";
import { formatDate } from "../lib/format";
import * as api from "../lib/api";
import type { LeaderboardEntry, RecentDraw } from "../lib/api";

const PODIUM_ORDER = [2, 1, 3];
const PODIUM_STYLE: Record<
  number,
  { pedestalHeight: string; avatarSize: string; medal: string; bg: string }
> = {
  1: {
    pedestalHeight: "h-28",
    avatarSize: "h-20 w-20 text-2xl",
    medal: "🥇",
    bg: "bg-gradient-to-b from-amber-300 to-amber-500",
  },
  2: {
    pedestalHeight: "h-20",
    avatarSize: "h-16 w-16 text-xl",
    medal: "🥈",
    bg: "bg-gradient-to-b from-slate-300 to-slate-400",
  },
  3: {
    pedestalHeight: "h-16",
    avatarSize: "h-16 w-16 text-xl",
    medal: "🥉",
    bg: "bg-gradient-to-b from-orange-300 to-orange-400",
  },
};

const REFRESH_INTERVAL_MS = 15000;

export default function RankingPage() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentDraws, setRecentDraws] = useState<RecentDraw[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [board, draws] = await Promise.all([
        api.fetchWeeklyLeaderboard(),
        api.fetchRecentDraws(),
      ]);
      setLeaderboard(board);
      setRecentDraws(draws);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-1 text-xl font-black text-brand-ink">即時榜單</h1>
      <p className="mb-6 text-sm text-gray-500">
        本週 point 消費排行榜（每週一凌晨 00:00 重新統計），以及全站最新抽獎戰績。
      </p>

      {loading ? (
        <p className="py-10 text-center text-sm text-gray-400">載入中…</p>
      ) : (
        <div className="mb-10 flex items-end justify-center gap-4 sm:gap-6">
          {PODIUM_ORDER.map((rank) => {
            const entry = leaderboard.find((e) => e.rank === rank);
            const style = PODIUM_STYLE[rank];
            return (
              <div key={rank} className="flex flex-col items-center">
                <span className="text-2xl">{style.medal}</span>
                <div
                  className={`mt-1 flex items-center justify-center rounded-full bg-white font-black text-brand-ink ring-2 ring-black/5 ${style.avatarSize}`}
                >
                  {entry ? entry.nickname.slice(0, 1) : "?"}
                </div>
                <p
                  className={`mt-2 max-w-24 truncate font-bold text-brand-ink ${rank === 1 ? "text-base" : "text-sm"}`}
                >
                  {entry ? entry.nickname : "尚無資料"}
                </p>
                <p className="text-xs font-bold text-brand-price">
                  {entry ? `🪙 ${entry.total_points}` : "—"}
                </p>
                <div
                  className={`mt-3 flex w-20 items-start justify-center rounded-t-lg pt-1.5 text-sm font-black text-white sm:w-24 ${style.pedestalHeight} ${style.bg}`}
                >
                  第 {rank} 名
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="mb-3 text-base font-black text-brand-ink">最新戰績</h2>

      {!loading && recentDraws.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-400">目前還沒有任何抽獎紀錄</p>
      )}

      <ul className="flex flex-col gap-2">
        {recentDraws.map((d) => {
          const visual = getTierVisual(d.tier);
          return (
            <li
              key={d.id}
              className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-black/5"
            >
              <span className="w-16 shrink-0 truncate text-sm font-bold text-brand-ink sm:w-20">
                {d.nickname}
              </span>
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                <CoverBlock
                  gradient={visual.gradient}
                  icon={visual.icon}
                  className="h-full w-full"
                  iconClassName="h-6 w-6"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className="mr-1.5 inline-block rounded px-1.5 py-0.5 text-xs font-black text-white"
                  style={{ backgroundColor: visual.color }}
                >
                  {d.tier}
                </span>
                <span className="truncate text-sm text-gray-600">{d.prize_name}</span>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/product/${d.product_id}`)}
                className="shrink-0 rounded-lg bg-brand-yellow px-3 py-1.5 text-xs font-black text-brand-ink transition-transform hover:scale-[1.02]"
              >
                抽獎去！
              </button>
              <span className="shrink-0 text-xs text-gray-400">{formatDate(d.created_at)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
