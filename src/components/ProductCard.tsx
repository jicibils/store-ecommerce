// src/components/ProductCard.tsx
import Image from "next/image";
import { Product } from "@/types/Product";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="border rounded-xl p-4 shadow-md hover:shadow-lg transition">
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
      <p className="text-sm text-gray-600">{product.category}</p>
      <p className="text-md font-bold">${product.price.toLocaleString()}</p>
      {product.stock === 0 && (
        <p className="text-red-500 text-sm mt-1">Sin stock</p>
      )}
    </div>
  );
}
