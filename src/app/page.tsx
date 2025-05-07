// src/app/page.tsx
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/Product";

export default async function HomePage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  if (error) {
    return <p className="text-red-600">Error al cargar productos</p>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Productos disponibles</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products?.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
