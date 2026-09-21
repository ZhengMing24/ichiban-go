import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Mode = "login" | "register";

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [realName, setRealName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setNickname("");
    setPhone("");
    setRealName("");
    setAddress("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "register" && password !== confirmPassword) {
      setError("兩次輸入的密碼不一致");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ email, password, nickname, phone, realName, address });
      }
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={handleClose}
    >
      <div
        className="max-h-full w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex gap-1 rounded-full bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 rounded-full py-2 text-sm font-bold transition-colors ${
              mode === "login"
                ? "bg-white text-brand-ink shadow-sm"
                : "text-gray-500"
            }`}
          >
            登入
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 rounded-full py-2 text-sm font-bold transition-colors ${
              mode === "register"
                ? "bg-white text-brand-ink shadow-sm"
                : "text-gray-500"
            }`}
          >
            註冊
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "register" && (
            <>
              <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                暱稱
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-brand-ink outline-none focus:border-brand-yellow"
                  placeholder="你的暱稱"
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
                  placeholder="收件人姓名"
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
                  placeholder="0912345678"
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
                  placeholder="收件地址"
                />
              </label>
            </>
          )}
          <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-brand-ink outline-none focus:border-brand-yellow"
              placeholder="you@example.com"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
            密碼
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-brand-ink outline-none focus:border-brand-yellow"
              placeholder="至少 8 碼"
            />
          </label>
          {mode === "register" && (
            <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
              確認密碼
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-brand-ink outline-none focus:border-brand-yellow"
                placeholder="再輸入一次密碼"
              />
            </label>
          )}

          {error && (
            <p className="text-sm font-bold text-brand-price">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-xl bg-brand-yellow py-3 text-sm font-black text-brand-ink transition-opacity disabled:opacity-60"
          >
            {isSubmitting ? "處理中..." : mode === "login" ? "登入" : "註冊並登入"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleClose}
          className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600"
        >
          取消
        </button>
      </div>
    </div>
  );
}
