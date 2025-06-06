// src/app/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/Product";
import ProductCard from "@/components/ProductCard";
import ProductsSearch from "@/components/ProductsSearch";
import ProductSkeleton from "@/components/ProductSkeleton";
import MarketComingSoon from "@/components/MarketComingSoon";

const PAGE_SIZE = 12;

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [filter, setFilter] = useState<"all" | "offers" | "market">("all");
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(
    async (reset = false) => {
      if (filter === "market") return; // no busca productos si es market

      setLoading(true);

      const offset = reset ? 0 : products.length;
      const from = offset;
      const to = offset + PAGE_SIZE - 1;

      let queryBuilder = supabase
        .from("products")
        .select("*")
        .gt("stock", 0)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (filter === "offers") queryBuilder = queryBuilder.eq("is_offer", true);
      else if (filter === "all") {
        queryBuilder = queryBuilder.eq("is_offer", false);
      }

      if (query) queryBuilder = queryBuilder.ilike("name", `%${query}%`);
      if (category) queryBuilder = queryBuilder.eq("category", category);

      const { data, error } = await queryBuilder.range(from, to);

      if (!error && data) {
        if (reset) {
          setProducts(data);
        } else {
          setProducts((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === PAGE_SIZE);
      }

      setLoading(false);
    },
    [category, query, filter, products.length]
  );

  useEffect(() => {
    fetchProducts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, filter]);

  return (
    <main className="p-6">
      {/* Pestañas de filtro */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
            filter === "all"
              ? "bg-black text-white"
              : "bg-muted text-foreground"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter("offers")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
            filter === "offers"
              ? "bg-black text-white"
              : "bg-muted text-foreground"
          }`}
        >
          Ofertas 🔥
        </button>
        <button
          onClick={() => setFilter("market")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
            filter === "market"
              ? "bg-black text-white"
              : "bg-muted text-foreground"
          }`}
        >
          Market 📦
        </button>
      </div>

      {/* Buscador y categoría solo si no es Market */}
      {filter !== "market" && (
        <ProductsSearch
          onChange={(q, c) => {
            setQuery(q);
            setCategory(c);
          }}
        />
      )}

      {filter === "market" ? (
        <MarketComingSoon />
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No se encontraron productos.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="flex justify-center mt-6">
            {hasMore ? (
              <button
                onClick={() => fetchProducts()}
                className="px-4 py-2 rounded bg-muted hover:bg-muted/80 border text-sm"
              >
                Cargar más productos
              </button>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No hay más productos para mostrar.
              </p>
            )}
          </div>
        </>
      )}

      {loading && filter !== "market" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      )}
    </main>
  );
}
