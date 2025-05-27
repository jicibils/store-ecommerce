"use client";

import { Product } from "@/types/Product";
import { CartItem, useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export default function ProductDetailsSheet({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart({ ...product, quantity } as CartItem);
    toast.success(`${product.name} x${quantity} agregado al carrito`);
  };

  const isOverStock = product.stock !== undefined && quantity > product.stock;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="w-full bg-muted hover:bg-muted/70 border text-foreground px-4 py-2 rounded text-sm font-medium transition cursor-pointer focus:ring-2 focus:ring-ring">
          Ver detalles
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col max-h-screen overflow-y-auto p-6"
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">{product.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4 flex-1">
          {product.image_url && (
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {product.category && (
            <p className="text-xs text-primary uppercase tracking-wide">
              {product.category}{" "}
              {product.is_offer && (
                <span className="ml-1 text-destructive font-semibold">
                  EN OFERTA 🔥
                </span>
              )}
            </p>
          )}

          {product.description && (
            <p className="text-sm text-muted-foreground">
              {product.description}
            </p>
          )}

          <p className="text-md font-semibold">
            Precio: ${product.price.toLocaleString()}{" "}
            <span className="text-sm text-muted-foreground">
              por {product.unit}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <label htmlFor="quantity" className="text-sm font-medium">
              Cantidad:
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 border rounded px-2 py-1"
            />
          </div>

          {isOverStock && (
            <p className="text-sm text-red-600">
              Solo hay {product.stock} unidades disponibles
            </p>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOverStock}
          className={`mt-6 py-2 px-4 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 w-full
            ${
              isOverStock
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
            }`}
        >
          Agregar al carrito
        </button>
      </SheetContent>
    </Sheet>
  );
}
