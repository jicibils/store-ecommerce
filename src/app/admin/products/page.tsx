// src/app/admin/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ConfirmDialog from "@/components/ConfirmDialog";
import Image from "next/image";
import { toast } from "sonner";
import { Product } from "@/types/Product";
import { getProxiedImagePath } from "@/lib/utils";
import capitalize from "lodash.capitalize";

type ProductWithCategory = Product & {
  category?: {
    name: string;
  };
  unit?: {
    label: string;
  };
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [filtered, setFiltered] = useState<ProductWithCategory[]>([]);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);
  const [showOffersOnly, setShowOffersOnly] = useState(false);
  const [showDiscountOnly, setShowDiscountOnly] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name), unit:units(label)")
        .order("name", { ascending: true });

      if (error) toast.error("Error cargando productos");
      else {
        setProducts(data);
        setFiltered(data);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name");
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    let result = products.filter((p: ProductWithCategory) =>
      p.name.toLowerCase().includes(lower)
    );

    if (filterState === "active") result = result.filter((p) => p.is_active);
    if (filterState === "inactive") result = result.filter((p) => !p.is_active);
    if (selectedCategory)
      result = result.filter((p) => p.category_id === selectedCategory);
    if (showOutOfStockOnly) result = result.filter((p) => p.stock === 0);
    if (showOffersOnly) result = result.filter((p) => p.is_offer);
    if (showDiscountOnly)
      result = result.filter((p) => p.discount && p.discount > 0);

    setFiltered(result);
    setPage(1);
  }, [
    search,
    products,
    filterState,
    showOutOfStockOnly,
    showOffersOnly,
    showDiscountOnly,
    selectedCategory,
  ]);

  const handleToggleActive = async (product: Product) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);

    if (error) toast.error("Error al cambiar estado");
    else {
      toast.success(
        `Producto ${!product.is_active ? "activado" : "desactivado"}`
      );
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: !product.is_active } : p
        )
      );
    }
  };

  const current = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Lista de productos</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 px-3 border border-gray-300 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-1 focus:ring-gray dark:focus:ring-white w-full sm:w-1/2 bg-white relative z-1"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded-full bg-muted dark:bg-zinc-800 text-sm z-1"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((state) => (
            <button
              key={state}
              onClick={() => setFilterState(state)}
              className={`relative z-1 px-3 py-1 text-sm border rounded-full transition cursor-pointer ${
                filterState === state
                  ? "bg-black text-white"
                  : "bg-muted text-foreground"
              }`}
            >
              {state === "all" && "Todos"}
              {state === "active" && "Activos"}
              {state === "inactive" && "Inactivos"}
            </button>
          ))}
          <button
            onClick={() => setShowOutOfStockOnly(!showOutOfStockOnly)}
            className={`relative z-1 px-3 py-1 text-sm border rounded-full transition cursor-pointer ${
              showOutOfStockOnly
                ? "bg-black text-white"
                : "bg-muted text-foreground"
            }`}
          >
            Sin stock
          </button>
          <button
            onClick={() => setShowOffersOnly(!showOffersOnly)}
            className={`relative z-1 px-3 py-1 text-sm border rounded-full transition cursor-pointer ${
              showOffersOnly
                ? "bg-black text-white"
                : "bg-muted text-foreground"
            }`}
          >
            Ofertas 🔥
          </button>

          <button
            onClick={() => setShowDiscountOnly(!showDiscountOnly)}
            className={`relative z-1 px-3 py-1 text-sm border rounded-full transition cursor-pointer ${
              showDiscountOnly
                ? "bg-black text-white"
                : "bg-muted text-foreground"
            }`}
          >
            Con descuento %
          </button>
        </div>
      </div>

      <ul>
        {current.map((p: ProductWithCategory) => (
          <li
            key={p.id}
            className="p-4 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800 flex items-center justify-between m-2 relative z-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 relative rounded overflow-hidden bg-muted shrink-0">
                {p.image_url && (
                  <Image
                    src={getProxiedImagePath(p.image_url)}
                    alt={p.name}
                    fill
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL="/placeholder.png"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                )}
              </div>

              <div>
                <p className="font-semibold flex items-center gap-2">
                  {p.name}
                  {p.is_active ? (
                    <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-medium">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-medium">
                      Inactivo
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  ${p.price} / {p.unit?.label ?? "—"} - Stock: {p.stock}
                  {p.is_offer && (
                    <span className="ml-2 text-red-600">🔥 Oferta</span>
                  )}
                  {!!p.discount && p.discount > 0 && (
                    <span className="ml-2 text-amber-600">-{p.discount}%</span>
                  )}
                </p>
                {p.category?.name && (
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium">
                    {capitalize(p.category.name)}
                  </span>
                )}
                <p className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
                  {p.description}
                </p>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={() => handleToggleActive(p)}
                className="text-xs px-2 py-1 border rounded-full bg-white text-foreground border-gray-300 hover:bg-muted transition cursor-pointer"
              >
                {p.is_active ? "Desactivar" : "Activar"}
              </button>
              <button
                onClick={() => router.push(`/admin/product?id=${p.id}`)}
                className="text-blue-600 hover:underline"
              >
                <Pencil />
              </button>
              <ConfirmDialog
                title="¿Eliminar producto? 🗑"
                description={`¿Querés eliminar ${p.name}?`}
                onConfirm={async () => {
                  const { error } = await supabase
                    .from("products")
                    .delete()
                    .eq("id", p.id);
                  if (error) toast.error("❌ No se pudo borrar");
                  else {
                    toast.success("✅ Producto borrado");
                    setProducts((prev) => prev.filter((x) => x.id !== p.id));
                  }
                }}
              >
                <button className="text-red-600 hover:underline">
                  <Trash2 />
                </button>
              </ConfirmDialog>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-center mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-1 border rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted cursor-pointer"
        >
          ← Anterior
        </button>

        <span className="text-sm text-muted-foreground">
          Página {page} de {totalPages}
        </span>

        <button
          disabled={current.length < perPage}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-1 border rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted cursor-pointer"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
