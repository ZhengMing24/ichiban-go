import { useState, type FormEvent } from "react";
import * as api from "../lib/api";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangePasswordModal({ open, onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("兩次輸入的新密碼不一致");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.changePassword({ currentPassword, newPassword, confirmPassword });
      resetForm();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "密碼修改失敗，請稍後再試");
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
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-black text-brand-ink">修改密碼</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
            目前密碼
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-brand-ink outline-none focus:border-brand-yellow"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
            新密碼
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-brand-ink outline-none focus:border-brand-yellow"
              placeholder="至少 8 碼"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
            確認新密碼
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-brand-ink outline-none focus:border-brand-yellow"
              placeholder="再輸入一次新密碼"
            />
          </label>

          {error && <p className="text-sm font-bold text-brand-price">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-xl bg-brand-yellow py-3 text-sm font-black text-brand-ink transition-opacity disabled:opacity-60"
          >
            {isSubmitting ? "處理中..." : "確認修改"}
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
