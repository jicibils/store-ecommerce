// src/app/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/Product";
import ProductCard from "@/components/ProductCard";
import ProductsSearch from "@/components/ProductsSearch";
import ProductSkeleton from "@/components/ProductSkeleton";

const PAGE_SIZE = 12;

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(
    async (reset = false) => {
      setLoading(true);

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let queryBuilder = supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      if (query) queryBuilder = queryBuilder.ilike("name", `%${query}%`);
      if (category) queryBuilder = queryBuilder.eq("category", category);

      const { data, error } = await queryBuilder.range(from, to);

      if (!error && data) {
        if (reset) {
          setProducts(data);
          setPage(1);
          setHasMore(data.length === PAGE_SIZE);
        } else {
          setProducts((prev) => [...prev, ...data]);
          setPage((prev) => prev + 1);
          setHasMore(data.length === PAGE_SIZE);
        }
      }
      setLoading(false);
    },
    [category, page, query]
  );

  useEffect(() => {
    fetchProducts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);

  return (
    <main className="p-6">
      <ProductsSearch
        onChange={(q, c) => {
          setQuery(q);
          setCategory(c);
          setPage(0);
        }}
      />

      {products.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No se encontraron productos.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      )}
    </main>
  );
}
