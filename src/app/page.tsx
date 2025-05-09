// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/Product";
import ProductCard from "@/components/ProductCard";
import ProductsSearch from "@/components/ProductsSearch";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const fetchProducts = async (search: string, cat: string) => {
    let queryBuilder = supabase
      .from("products")
      .select("*")
      .eq("is_active", true);

    if (search) queryBuilder = queryBuilder.ilike("name", `%${search}%`);
    if (cat) queryBuilder = queryBuilder.eq("category", cat);

    const { data, error } = await queryBuilder;
    if (!error) setProducts(data || []);
  };

  useEffect(() => {
    fetchProducts(query, category);
  }, [query, category]);

  return (
    <main className="p-6">
      <ProductsSearch
        onChange={(q, c) => {
          setQuery(q);
          setCategory(c);
        }}
      />

      {products.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No se encontraron productos.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
