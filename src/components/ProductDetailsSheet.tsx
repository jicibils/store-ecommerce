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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="w-full bg-muted hover:bg-muted/70 border text-foreground px-4 py-2 rounded text-sm font-medium transition cursor-pointer focus:ring-2 focus:ring-ring">
          Ver detalles
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{product.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {product.image_url && (
            <div className="relative w-full aspect-square rounded-lg overflow-hidden">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
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

          <button
            onClick={handleAddToCart}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition"
          >
            Agregar al carrito
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
