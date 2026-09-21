import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

interface ShippingFormModalProps {
  open: boolean;
  itemCount: number;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (input: { recipientName: string; phone: string; address: string; note: string }) => void;
  onClose: () => void;
}

export default function ShippingFormModal({
  open,
  itemCount,
  isSubmitting,
  error,
  onSubmit,
  onClose,
}: ShippingFormModalProps) {
  const { user } = useAuth();
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open && user) {
      setRecipientName(user.real_name);
      setPhone(user.phone);
      setAddress(user.address);
      setNote("");
    }
  }, [open, user]);

  if (!open) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ recipientName, phone, address, note });
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
        <h3 className="mb-1 text-lg font-black text-brand-ink">商品寄送</h3>
        <p className="mb-4 text-sm text-gray-500">
          即將寄出所選的 <span className="font-bold text-brand-ink">{itemCount}</span> 項商品，請確認收件資訊。
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
            收件人姓名
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
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
            收件地址
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-brand-ink outline-none focus:border-brand-yellow"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
            備註（選填）
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-brand-ink outline-none focus:border-brand-yellow"
            />
          </label>

          {error && <p className="text-sm font-bold text-brand-price">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-xl bg-brand-yellow py-3 text-sm font-black text-brand-ink transition-opacity disabled:opacity-60"
          >
            {isSubmitting ? "寄送申請中…" : "確認寄送"}
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
