"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/Product";
import ProductCard from "@/components/ProductCard";
import ProductsSearch from "@/components/ProductsSearch";
import ProductSkeleton from "@/components/ProductSkeleton";
import { motion } from "framer-motion";
import { CATEGORY_TYPE } from "@/lib/constants";

const PAGE_SIZE = 12;

export default function FruverPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [filter] = useState<"all">("all");
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string }[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // 🚀 Traer categorías una sola vez
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id")
        .eq("type", CATEGORY_TYPE.VERDULERIA);

      if (data) {
        setCategories(data);
      }
      setCategoriesLoaded(true);
    };

    fetchCategories();
  }, []);

  // 🚀 Traer productos
  const fetchProducts = useCallback(
    async (reset = false, currentCount = 0) => {
      if (!categoriesLoaded) return;

      if (categories.length === 0) {
        console.warn("No hay categorías de verdulería");
        setProducts([]);
        setHasMore(false);
        return;
      }

      setLoading(true);

      const offset = reset ? 0 : currentCount;
      const from = offset;
      const to = offset + PAGE_SIZE - 1;

      let queryBuilder = supabase
        .from("products")
        .select("*, category:categories(name), unit:units(label)")
        .gt("stock", 0)
        .eq("is_active", true)
        .in(
          "category_id",
          categories.map((c) => c.id)
        )
        .order("name", { ascending: true });

      if (filter === "all") {
        queryBuilder = queryBuilder.eq("is_offer", false);
      }

      if (query) queryBuilder = queryBuilder.ilike("name", `%${query}%`);
      if (category) queryBuilder = queryBuilder.eq("category_id", category);

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
    [categoriesLoaded, categories, category, query, filter]
  );

  // 🚀 Ejecutar solo cuando categoriesLoaded = true
  useEffect(() => {
    if (categoriesLoaded) {
      fetchProducts(true);
    }
  }, [query, category, filter, categoriesLoaded, fetchProducts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <main className="p-6 max-w-7xl mx-auto min-h-screen space-y-8">
        <section className="text-center">
          <h1 className="text-3xl font-bold mb-2">Verdulería 🥑</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Las frutas y verduras más frescas, directo a tu casa. Elegí tus
            productos favoritos y disfrutá calidad todos los días.
          </p>
        </section>
        <ProductsSearch
          type={[CATEGORY_TYPE.VERDULERIA]}
          selectedCategory={category}
          onChange={(q, c) => {
            setQuery(q);
            setCategory(c);
          }}
        />

        {products.length === 0 && !loading ? (
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
                <p className="text-sm text-muted-foreground italic">
                  No hay más productos para mostrar.
                </p>
              )}
            </div>
          </>
        )}

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
