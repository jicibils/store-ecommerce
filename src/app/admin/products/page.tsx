// /src/app/admin/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ConfirmDialog from "@/components/ConfirmDialog";
import Image from "next/image";
import { toast } from "sonner";
import { Product } from "@/types/Product";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
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
    const lower = search.toLowerCase();
    setFiltered(
      products.filter((p: Product) => p.name.toLowerCase().includes(lower))
    );
    setPage(1);
  }, [search, products]);

  const current = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Lista de productos</h1>

      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border w-full"
      />

      <ul>
        {current.map((p: Product) => (
          <li
            key={p.id}
            className="flex items-center justify-between border-b py-2"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 relative rounded overflow-hidden bg-muted shrink-0">
                {p.image_url && (
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <div>
                <p className="font-semibold flex items-center gap-2">
                  {p.name}
                  {p.is_active ? (
                    <span className="text-green-600 text-xs font-normal">
                      activo
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs font-normal">
                      inactivo
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  ${p.price} / {p.unit} - Stock: {p.stock}
                  {p.is_offer && (
                    <span className="ml-2 text-red-600">🔥 Oferta</span>
                  )}
                  {!!p.discount && p.discount > 0 && (
                    <span className="ml-2 text-amber-600">-{p.discount}%</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{p.category}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
                  {p.description}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
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

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-1 border rounded disabled:opacity-50"
        >
          ← Anterior
        </button>

        <span>
          Página {page} de {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-1 border rounded disabled:opacity-50"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
