import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import ChangePasswordModal from "../components/ChangePasswordModal";
import InfoModal from "../components/InfoModal";
import { useAuth } from "../context/AuthContext";
import * as api from "../lib/api";

export default function AccountPage() {
  const { user, setUser } = useAuth();
  const [nickname, setNickname] = useState("");
  const [realName, setRealName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setNickname(user.nickname);
    setRealName(user.real_name);
    setPhone(user.phone);
    setAddress(user.address);
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg font-bold text-gray-500">請先登入查看會員中心</p>
        <Link to="/" className="mt-4 inline-block text-brand-price underline">
          回到首頁
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const updated = await api.updateProfile({ nickname, phone, realName, address });
      setUser(updated);
      setSuccessMessage("會員資料已更新");
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失敗，請稍後再試");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-1 text-xl font-black text-brand-ink">會員中心</h1>
      <p className="mb-6 text-sm text-gray-500">管理你的會員資料與密碼。</p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl bg-white p-6 ring-1 ring-black/5"
      >
        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
          信箱
          <input
            type="email"
            value={user.email}
            disabled
            className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-400"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
          暱稱
          <input
            type="text"
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-brand-ink outline-none focus:border-brand-yellow"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
          真實姓名
          <input
            type="text"
            required
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-brand-ink outline-none focus:border-brand-yellow"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
          電話
          <input
            type="tel"
            required
            pattern="09\d{8}"
            title="請輸入台灣手機號碼，例如 0912345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-brand-ink outline-none focus:border-brand-yellow"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
          地址
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-brand-ink outline-none focus:border-brand-yellow"
          />
        </label>

        {error && <p className="text-sm font-bold text-brand-price">{error}</p>}

        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-xl bg-brand-yellow py-3 text-sm font-black text-brand-ink transition-opacity disabled:opacity-60"
          >
            {isSaving ? "儲存中…" : "儲存變更"}
          </button>
          <button
            type="button"
            onClick={() => setPasswordModalOpen(true)}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            修改密碼
          </button>
        </div>
      </form>

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSuccess={() => {
          setPasswordModalOpen(false);
          setSuccessMessage("密碼修改成功");
        }}
      />

      <InfoModal
        title={successMessage ? "成功" : null}
        body={successMessage ?? ""}
        onClose={() => setSuccessMessage(null)}
      />
    </div>
  );
}
