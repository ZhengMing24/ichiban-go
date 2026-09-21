import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const NAV_ITEMS = [
  { label: "一番賞", to: "/" },
  { label: "商城", to: "/shop" },
  { label: "賞品盒", to: "/box" },
  { label: "即時榜單", to: "/ranking" },
  { label: "每日活動", to: "/events" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-ink text-lg font-black text-brand-yellow">
            番
          </span>
          <span className="text-lg font-black tracking-tight text-brand-ink">
            Ichiban<span className="text-brand-price">Go</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-brand-ink text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/topup"
            className="hidden items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-bold text-gray-700 hover:bg-gray-50 sm:flex"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-yellow text-xs">
              🪙
            </span>
            {user ? user.points : "儲值"}
          </Link>
          {user ? (
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((v) => !v)}
                className="hidden rounded-full px-2 py-1 text-sm font-bold text-brand-ink hover:bg-gray-100 sm:inline"
              >
                {user.nickname}
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                登出
              </button>

              {accountMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAccountMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5">
                    <Link
                      to="/account"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-brand-price"
                    >
                      會員中心
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="rounded-full bg-brand-ink px-4 py-2 text-sm font-bold text-white hover:opacity-90"
            >
              登入 / 註冊
            </button>
          )}
          <button
            type="button"
            aria-label="開啟選單"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-black/5 px-4 py-3 md:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-bold ${
                  isActive ? "bg-brand-ink text-white" : "text-gray-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
}
