import { useMemo, useState } from "react";
import CategoryTabs from "../components/CategoryTabs";
import FilterBar, { type SortOption } from "../components/FilterBar";
import HeroCarousel from "../components/HeroCarousel";
import ProductGrid from "../components/ProductGrid";
import ProductCard from "../components/ProductCard";
import { applyRealStock, CATEGORIES, PRODUCTS } from "../data/mockData";
import { useProductStocks } from "../hooks/useProductStocks";
import type { Category } from "../types";

export default function HomePage() {
  const [category, setCategory] = useState<Category | "全部">("全部");
  const [sort, setSort] = useState<SortOption>("recommended");
  const stocks = useProductStocks();

  const products = useMemo(() => applyRealStock(PRODUCTS, stocks), [stocks]);

  const newProducts = useMemo(
    () => products.filter((p) => p.isNew).slice(0, 4),
    [products],
  );

  const filteredProducts = useMemo(() => {
    let list =
      category === "全部"
        ? products
        : products.filter((p) => p.category === category);

    list = [...list];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "newest")
      list.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));

    return list;
  }, [products, category, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <HeroCarousel />

      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-brand-ink">
          <span className="rounded bg-brand-yellow px-2 py-0.5 text-sm">
            New
          </span>
          新品推薦
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <hr className="my-8 border-dashed border-gray-300" />

      <section className="flex flex-col gap-4">
        <CategoryTabs
          categories={CATEGORIES}
          active={category}
          onChange={setCategory}
        />
        <FilterBar
          sort={sort}
          onSortChange={setSort}
          total={filteredProducts.length}
        />
        <ProductGrid products={filteredProducts} />
      </section>
    </div>
  );
}
