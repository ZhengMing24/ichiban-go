import { Link } from "react-router-dom";
import type { Product } from "../types";
import CoverBlock from "./CoverBlock";

const statusStyle: Record<Product["status"], string> = {
  現貨: "bg-emerald-100 text-emerald-700",
  預購: "bg-sky-100 text-sky-700",
  已售完: "bg-gray-200 text-gray-500",
};

export default function ProductCard({ product }: { product: Product }) {
  const isSoldOut = product.remainingCount === 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square">
        <CoverBlock
          gradient={product.coverGradient}
          icon={product.icon}
          className="h-full w-full"
        />
        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-bold text-white">
          {product.remainingCount} / {product.totalCount}
        </span>
        {product.isHot && (
          <span className="absolute right-2 top-2 rounded-md bg-brand-price px-1.5 py-0.5 text-xs font-bold text-white">
            熱門
          </span>
        )}
        {product.isNew && !product.isHot && (
          <span className="absolute right-2 top-2 rounded-md bg-emerald-500 px-1.5 py-0.5 text-xs font-bold text-white">
            新品
          </span>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded border-2 border-white px-3 py-1 text-sm font-black text-white">
              完售
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-bold text-brand-ink group-hover:text-brand-price">
          {product.title}
        </h3>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {product.originalPrice}
              </span>
            )}
            <span className="text-lg font-black text-brand-price">
              {product.price}
            </span>
            <span className="text-xs text-gray-400">/ 抽</span>
          </div>
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-bold ${statusStyle[product.status]}`}
          >
            {product.status}
          </span>
        </div>
      </div>
    </Link>
  );
}
