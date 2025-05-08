// src/components/ProductCard.tsx
"use client";

import { Product } from "@/types/Product";
import Image from "next/image";
import { toast } from "sonner";

import { useCart } from "@/contexts/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="border rounded-xl p-4 shadow-md hover:shadow-lg transition flex flex-col">
      <div className="w-full aspect-square relative mb-2">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Sin imagen</span>
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-md font-bold">${product.price.toLocaleString()}</p>

      <button
        onClick={() => {
          addToCart(product);
          toast.success(`${product.name} agregado al carrito 🛒`);
        }}
        className="mt-auto bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
      >
        Agregar al carrito
      </button>
    </div>
  );
}
