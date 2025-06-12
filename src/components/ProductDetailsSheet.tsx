// src/components/ProductDetailsSheet.tsx
"use client";

import { Product } from "@/types/Product";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import capitalize from "lodash.capitalize";
import { useCart } from "@/contexts/CartContext";
import { getProxiedImagePath } from "@/lib/utils";

export default function ProductDetailsSheet({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { cart } = useCart();
  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col max-h-screen overflow-y-auto p-6"
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">
            {capitalize(product.name)}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4 flex-1">
          {product.image_url && (
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md">
              <Image
                src={getProxiedImagePath(product.image_url)}
                alt={product.name}
                fill
                className="object-cover"
                placeholder="blur"
                blurDataURL="/placeholder.png"
              />
              {!!product.discount && product.discount > 0 && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded shadow z-10">
                  {product.discount}% OFF
                </div>
              )}
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
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>
          )}

          <div className="text-md font-semibold">
            Precio: ${discountedPrice.toLocaleString()}
            {!!product.discount && product.discount > 0 && (
              <span className="ml-2 text-sm line-through text-muted-foreground">
                ${product.price.toLocaleString()}
              </span>
            )}
            <div className="text-sm text-muted-foreground">
              por {product.unit}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Stock disponible: {product.stock}
          </p>

          <p className="text-sm">
            Ya agregaste:{" "}
            <span className="font-semibold">
              {quantity} {quantity === 1 ? "producto" : "productos"}
            </span>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
