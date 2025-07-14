"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/Product";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import { motion } from "framer-motion";
import GlobalSearchBar from "@/components/GlobalSearch";

const PAGE_SIZE = 12;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const fetchProducts = useCallback(
    async (reset = false, currentCount = 0) => {
      if (!q.trim()) return;

      setLoading(true);

      const offset = reset ? 0 : currentCount;
      const from = offset;
      const to = offset + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name), unit:units(label)")
        .ilike("name", `%${q}%`)
        .gt("stock", 0)
        .eq("is_active", true)
        .order("name", { ascending: true })
        .range(from, to);

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
    [q]
  );

  useEffect(() => {
    if (q.trim()) {
      fetchProducts(true);
    } else {
      setProducts([]);
      setHasMore(false);
    }
  }, [q, fetchProducts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <main className="p-6 max-w-7xl mx-auto min-h-screen space-y-8">
        {/* Barra de búsqueda */}
        <GlobalSearchBar />

        {/* Resultados */}
        {!q.trim() ? (
          <p className="text-center text-muted-foreground mt-8">
            Ingresá un término de búsqueda para ver productos.
          </p>
        ) : products.length === 0 && !loading ? (
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
                  onClick={() => fetchProducts(false, products.length)}
                  className="mb-2 px-4 py-2 rounded bg-muted hover:bg-muted/80 border text-sm cursor-pointer bg-white relative z-1"
                >
                  Cargar más productos
                </button>
              ) : (
                products.length > 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No hay más productos para mostrar.
                  </p>
                )
              )}
            </div>
          </>
        )}

        {/* Skeleton Loader */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}
      </main>
    </motion.div>
  );
}
