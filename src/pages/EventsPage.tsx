import { useCallback, useEffect, useState } from "react";
import InfoModal from "../components/InfoModal";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";
import type { DailySpendTier, DailyTaskStatus } from "../lib/api";

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div className="h-full rounded-full bg-brand-yellow transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

interface TaskRowProps {
  title: string;
  subtitle: string;
  reward: number;
  reached: boolean;
  claimed: boolean;
  isClaiming: boolean;
  onClaim: () => void;
  progress?: { value: number; max: number };
}

function TaskRow({ title, subtitle, reward, reached, claimed, isClaiming, onClaim, progress }: TaskRowProps) {
  const label = claimed ? "已領取" : reached ? (isClaiming ? "處理中…" : `領取獎勵 🪙${reward}`) : `🪙${reward}`;

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-brand-ink">{title}</p>
          <p className={progress ? "mb-2 text-xs text-gray-400" : "text-xs text-gray-400"}>{subtitle}</p>
          {progress && <ProgressBar value={progress.value} max={progress.max} />}
        </div>
        <button
          type="button"
          disabled={!reached || claimed || isClaiming}
          onClick={onClaim}
          className="shrink-0 rounded-lg bg-brand-yellow px-4 py-2 text-sm font-black text-brand-ink transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:scale-100"
        >
          {label}
        </button>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { user, setUser } = useAuth();
  const [status, setStatus] = useState<DailyTaskStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingKey, setClaimingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);

  const userId = user?.id;

  const load = useCallback(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .fetchDailyTasks()
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => load(), [load]);

  const handleClaimCheckin = async () => {
    setClaimingKey("checkin");
    setErrorMessage(null);
    try {
      const result = await api.claimDailyCheckin();
      setUser((prev) => (prev ? { ...prev, points: result.points } : prev));
      setRewardMessage(`簽到成功，獲得 ${result.reward} 點！`);
      load();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "簽到失敗，請稍後再試");
    } finally {
      setClaimingKey(null);
    }
  };

  const handleClaimSpendTier = async (tier: DailySpendTier) => {
    const key = `tier-${tier.tier}`;
    setClaimingKey(key);
    setErrorMessage(null);
    try {
      const result = await api.claimDailySpendTier(tier.tier);
      setUser((prev) => (prev ? { ...prev, points: result.points } : prev));
      setRewardMessage(`任務完成，獲得 ${result.reward} 點！`);
      load();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "領取失敗，請稍後再試");
    } finally {
      setClaimingKey(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-xl font-black text-brand-ink">每日活動</h1>
      <p className="mb-6 text-sm text-gray-500">
        每天都能完成的任務，簽到跟抽獎消費越多，領到的點數越多。每天 00:00 重新開始計算。
      </p>

      {!user && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-16 text-gray-400 ring-1 ring-black/5">
          <span className="text-4xl">🔒</span>
          <p>請先登入查看每日活動</p>
        </div>
      )}

      {user && loading && <p className="py-10 text-center text-sm text-gray-400">載入中…</p>}

      {user && !loading && !status && (
        <p className="py-10 text-center text-sm text-gray-400">載入失敗，請重新整理再試一次</p>
      )}

      {user && !loading && status && (
        <div className="flex flex-col gap-3">
          <TaskRow
            title="每日簽到"
            subtitle="登入並簽到即可領取獎勵"
            reward={status.checkin.reward}
            reached={true}
            claimed={status.checkin.claimed}
            isClaiming={claimingKey === "checkin"}
            onClaim={() => void handleClaimCheckin()}
          />

          {status.spend_tiers.map((t) => (
            <TaskRow
              key={t.tier}
              title={`今日抽獎消費滿 ${t.threshold} 點`}
              subtitle={`${Math.min(status.spend_today, t.threshold)} / ${t.threshold}`}
              reward={t.reward}
              reached={t.reached}
              claimed={t.claimed}
              isClaiming={claimingKey === `tier-${t.tier}`}
              onClaim={() => void handleClaimSpendTier(t)}
              progress={{ value: status.spend_today, max: t.threshold }}
            />
          ))}
        </div>
      )}

      <InfoModal
        title={errorMessage ? "提醒" : null}
        body={errorMessage ?? ""}
        onClose={() => setErrorMessage(null)}
      />

      <InfoModal
        title={rewardMessage ? "恭喜" : null}
        body={rewardMessage ?? ""}
        onClose={() => setRewardMessage(null)}
      />
    </div>
  );
}
