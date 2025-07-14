/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/Product";
import ProductCard from "@/components/ProductCard";
import ProductsSearch from "@/components/ProductsSearch";
import ProductSkeleton from "@/components/ProductSkeleton";
import CategoryCarousel from "@/components/CategoryCarousel";
import { motion } from "framer-motion";
import { CATEGORY_TYPE } from "@/lib/constants";
import capitalize from "lodash.capitalize";
import * as LucideIcons from "lucide-react";

const PAGE_SIZE = 12;

export default function MarketPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<
    { id: string; name: string; type: string; icon: any }[]
  >([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // 🚀 Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, type, icon")
        .eq("type", CATEGORY_TYPE.MARKET)
        .order("name");

      if (data) {
        setCategories(
          data.map((c) => ({
            ...c,
            icon:
              (LucideIcons as any)[capitalize(c.icon)] || LucideIcons.Package,
          }))
        );
      }
      setCategoriesLoaded(true);
    };

    fetchCategories();
  }, []);

  // 🚀 Fetch products
  const fetchProducts = useCallback(
    async (reset = false, currentCount = 0) => {
      if (!categoriesLoaded) {
        console.warn("Esperando que carguen las categorías");
        return;
      }

      setLoading(true);

      const marketCategoryIds = categories.map((c) => c.id);

      if (marketCategoryIds.length === 0) {
        console.warn("No hay categorías tipo market");
        setProducts([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      const offset = reset ? 0 : currentCount;
      const from = offset;
      const to = offset + PAGE_SIZE - 1;

      let queryBuilder = supabase
        .from("products")
        .select("*, category:categories(name), unit:units(label)")
        .gt("stock", 0)
        .eq("is_active", true)
        .in("category_id", marketCategoryIds)
        .order("name", { ascending: true });

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
    [query, category, categoriesLoaded, categories]
  );

  // 🚀 Refresh on filters change
  useEffect(() => {
    if (categoriesLoaded) {
      fetchProducts(true, 0);
    }
  }, [query, category, categoriesLoaded, fetchProducts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <main className="p-6 max-w-7xl mx-auto min-h-screen space-y-8">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-3xl font-bold mb-2">Market 📦</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitás en un solo lugar. Encontrá productos de
            calidad y ofertas especiales.
          </p>
        </section>

        {/* Carrusel de categorías */}
        <CategoryCarousel
          categories={categories}
          onSelectCategory={(id) => {
            setCategory(id);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        {/* Buscador y filtros */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 w-full">
            <ProductsSearch
              type={[CATEGORY_TYPE.MARKET]}
              selectedCategory={category}
              onChange={(q, c) => {
                setQuery(q);
                setCategory(c);
              }}
            />
          </div>
        </div>

        {/* Badge */}
        {category && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">
              Filtrando por:
            </span>
            <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
              {capitalize(categories.find((c) => c.id === category)?.name)}
            </span>
            <button
              onClick={() => setCategory("")}
              className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer"
            >
              Quitar filtro
            </button>
          </div>
        )}

        {/* Productos */}
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
