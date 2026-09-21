import type { Product } from "../types";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-16 text-gray-400 ring-1 ring-black/5">
        <span className="text-4xl">🎐</span>
        <p>此分類下沒有找到商品</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
