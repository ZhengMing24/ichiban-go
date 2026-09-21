import { useState } from "react";
import InfoModal from "../components/InfoModal";
import { useAuth } from "../context/AuthContext";

const PLANS = [
  { price: 100, bonus: 0 },
  { price: 300, bonus: 0 },
  { price: 500, bonus: 10 },
  { price: 1000, bonus: 30, tag: "熱門" },
  { price: 3000, bonus: 150 },
  { price: 5000, bonus: 300, tag: "超值" },
  { price: 10000, bonus: 800 },
  { price: 30000, bonus: 3000, tag: "最划算" },
];

const PAYMENT_METHODS = [
  { id: "card", icon: "💳", label: "信用卡", note: "Visa / Master / JCB", enabled: true },
  { id: "atm", icon: "🏦", label: "ATM 轉帳", note: "虛擬帳號，入帳約 5 分鐘", enabled: true },
  { id: "cvs", icon: "🏪", label: "超商代碼", note: "7-11 / 全家 / 萊爾富", enabled: true },
  { id: "linepay", icon: "🟢", label: "LINE Pay", note: "", enabled: false },
  { id: "jkopay", icon: "🔴", label: "街口支付", note: "", enabled: false },
  { id: "applepay", icon: "", label: "Apple Pay", note: "", enabled: false },
];

export default function TopUpPage() {
  const { user } = useAuth();
  const [planIndex, setPlanIndex] = useState(3);
  const [methodId, setMethodId] = useState(PAYMENT_METHODS[0].id);
  const [message, setMessage] = useState<string | null>(null);

  const plan = PLANS[planIndex];
  const method = PAYMENT_METHODS.find((m) => m.id === methodId)!;
  const totalPoints = plan.price + plan.bonus;

  const handleSubmit = () => {
    setMessage(
      user
        ? "儲值功能即將開放，目前測試帳號可由客服協助加值。"
        : "請先登入會員，才能進行儲值。",
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-1 text-xl font-black text-brand-ink">儲值中心</h1>
      <p className="mb-5 text-sm text-gray-500">1 元 = 1 點，儲值越多加贈越多，點數可用於抽獎與商城兌換。</p>

      <div className="mb-6 flex items-center justify-between rounded-2xl bg-brand-ink px-5 py-5 text-white shadow-sm">
        <div>
          <p className="text-xs font-bold text-white/60">目前點數餘額</p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-black text-brand-yellow">
            <span className="text-2xl">🪙</span>
            {user ? user.points.toLocaleString() : "--"}
          </p>
        </div>
        {!user && <p className="text-xs font-bold text-white/60">登入後即可查看餘額</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-black text-brand-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-yellow text-xs">1</span>
              選擇儲值方案
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PLANS.map((p, i) => {
                const selected = i === planIndex;
                return (
                  <button
                    key={p.price}
                    type="button"
                    onClick={() => setPlanIndex(i)}
                    className={`relative flex flex-col items-center rounded-xl border-2 px-2 pb-3 pt-4 transition-colors ${
                      selected
                        ? "border-brand-yellow-dark bg-brand-yellow/15"
                        : "border-gray-100 bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    {p.tag && (
                      <span className="absolute -top-2 right-2 rounded-full bg-brand-price px-2 py-0.5 text-[10px] font-black text-white">
                        {p.tag}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-lg font-black text-brand-ink">
                      🪙 {p.price.toLocaleString()}
                    </span>
                    <span className={`mt-1 text-xs font-bold ${p.bonus > 0 ? "text-brand-price" : "text-transparent"}`}>
                      加贈 {p.bonus.toLocaleString()} 點
                    </span>
                    <span className="mt-2 w-full rounded-lg bg-white py-1 text-xs font-bold text-gray-600 ring-1 ring-black/5">
                      NT$ {p.price.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-black text-brand-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-yellow text-xs">2</span>
              選擇付款方式
              <span className="ml-auto text-xs font-bold text-gray-400">金流由綠界科技 ECPay 提供</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((m) => {
                const selected = m.id === methodId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={!m.enabled}
                    onClick={() => setMethodId(m.id)}
                    className={`relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      selected
                        ? "border-brand-yellow-dark bg-brand-yellow/15"
                        : "border-gray-100 bg-gray-50 enabled:hover:border-gray-200"
                    }`}
                  >
                    {!m.enabled && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                        即將開放
                      </span>
                    )}
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected ? "border-brand-ink" : "border-gray-300"
                      }`}
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-brand-ink" />}
                    </span>
                    <span className="text-lg">{m.icon}</span>
                    <span className="flex flex-col">
                      <span className="text-sm font-black text-brand-ink">{m.label}</span>
                      {m.note && <span className="text-xs text-gray-400">{m.note}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 text-sm leading-7 text-gray-500 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-2 text-base font-black text-brand-ink">儲值須知</h2>
            <ol className="list-decimal pl-5">
              <li>點數儲值後即存入會員帳號，可用於抽獎及點數商城兌換。</li>
              <li>加贈點數於付款完成後一併入帳。</li>
              <li>ATM 轉帳與超商代碼需於 24 小時內完成付款，逾期訂單自動取消。</li>
              <li>點數一經儲值恕不退款，亦不得轉讓或折現。</li>
              <li>付款完成後若點數未入帳，請聯繫客服並提供訂單編號。</li>
            </ol>
          </section>
        </div>

        <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 lg:sticky lg:top-24">
          <h2 className="mb-4 text-base font-black text-brand-ink">訂單摘要</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">儲值點數</dt>
              <dd className="font-bold text-brand-ink">{plan.price.toLocaleString()} 點</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">加贈點數</dt>
              <dd className="font-bold text-brand-price">+{plan.bonus.toLocaleString()} 點</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">付款方式</dt>
              <dd className="font-bold text-brand-ink">{method.label}</dd>
            </div>
            <div className="flex justify-between border-t border-dashed border-gray-200 pt-3">
              <dt className="text-gray-500">實得點數</dt>
              <dd className="font-black text-brand-ink">🪙 {totalPoints.toLocaleString()}</dd>
            </div>
            {user && (
              <div className="flex justify-between">
                <dt className="text-gray-500">儲值後餘額</dt>
                <dd className="font-bold text-brand-ink">{(user.points + totalPoints).toLocaleString()} 點</dd>
              </div>
            )}
          </dl>

          <div className="mt-4 flex items-end justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="text-sm font-bold text-gray-500">應付金額</span>
            <span className="text-2xl font-black text-brand-price">NT$ {plan.price.toLocaleString()}</span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="mt-4 w-full rounded-xl bg-brand-yellow py-3 text-sm font-black text-brand-ink transition-transform hover:scale-[1.01]"
          >
            確認儲值
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">點擊即表示同意本站服務條款與儲值須知</p>
        </aside>
      </div>

      <InfoModal title={message ? "儲值" : null} body={message ?? ""} onClose={() => setMessage(null)} />
    </div>
  );
}
