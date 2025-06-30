import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CATEGORY_TYPE } from "@/lib/constants";
import capitalize from "lodash.capitalize";

type Props = {
  onChange: (query: string, category: string) => void;
  type: CATEGORY_TYPE[]; // acepta uno o más tipos
  selectedCategory: string; // 🚀 le pasamos la categoría externa
};

export default function ProductsSearch({
  onChange,
  type,
  selectedCategory,
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  // 🚀 Sync externo -> interno
  useEffect(() => {
    setCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .in("type", type)
        .order("name");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, [type]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(query, category);
    }, 300);
    return () => clearTimeout(handler);
  }, [query, category, onChange]);

  return (
    <section className="w-full mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-96 md:w-[500px] border rounded-full px-4 py-2 justify-self-center shadow-sm bg-white relative z-1"
        />
        <select
          className="border p-2 rounded-full text-sm w-full sm:w-48 justify-self-end shadow-sm bg-white relative z-1"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {capitalize(cat.name)}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
