// src/components/ProductCard.tsx
"use client";

import { Product } from "@/types/Product";
import Image from "next/image";
import capitalize from "lodash.capitalize";
import ProductDetailsSheet from "./ProductDetailsSheet";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="rounded-xl border bg-card p-3 shadow-sm hover:shadow-md transition-transform hover:scale-[1.01] text-card-foreground flex flex-col overflow-hidden text-sm">
      <div className="relative aspect-square w-full">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-base font-semibold leading-tight">
          {capitalize(product.name)}
        </h3>
        <p className="text-lg font-bold text-primary">
          ${product.price.toLocaleString()}
        </p>
        <ProductDetailsSheet product={product} />
      </div>
    </div>
  );
}
