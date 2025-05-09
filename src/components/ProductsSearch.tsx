"use client";

import { useState, useEffect } from "react";

export default function ProductsSearch({
  onChange,
}: {
  onChange: (query: string, category: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(query, category);
    }, 300);

    return () => clearTimeout(handler);
  }, [query, category]);

  return (
    <section className="w-full  mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div /> {/* vacío: margen izquierdo */}
        <input
          type="text"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-96 md:w-[500px] border rounded-full px-4 py-2 justify-self-center shadow-sm"
        />
        <select
          className="border p-2 rounded-full text-sm bg-background w-full sm:w-48 justify-self-end shadow-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          <option value="frutas">Frutas</option>
          <option value="verduras">Verduras</option>
          <option value="viandas">Viandas</option>
        </select>
      </div>
    </section>
  );
}
