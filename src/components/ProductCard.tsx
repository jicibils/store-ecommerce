// src/components/ProductCard.tsx
"use client";

import { Product } from "@/types/Product";
import Image from "next/image";
import capitalize from "lodash.capitalize";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import ProductDetailsSheet from "./ProductDetailsSheet";
import { getProxiedImagePath } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const [open, setOpen] = useState(false);
  const cartItem = cart.find((item) => item.id === product.id);

  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const handleAdd = () => {
    if (!product.stock || (cartItem?.quantity ?? 0) >= product.stock) return;
    addToCart({ ...product, price: discountedPrice });
  };

  const handleUpdate = (qty: number) => {
    if (qty <= 0) {
      removeFromCart(product.id);
    } else if (qty <= (product.stock ?? 0)) {
      updateQuantity(product.id, qty);
    }
  };

  const showStockWarning =
    !!cartItem?.quantity && cartItem?.quantity >= (product.stock ?? 0);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 flex flex-col overflow-hidden text-sm relative z-1">
      <div
        className="relative aspect-square w-full cursor-pointer"
        onClick={() => setOpen(true)}
      >
        {!!product.discount && product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded shadow z-10">
            {product.discount}% OFF
          </div>
        )}

        {product.image_url ? (
          <Image
            src={getProxiedImagePath(product.image_url)}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover rounded-md"
            placeholder="blur"
            blurDataURL="/placeholder.png"
            onError={(e) => (e.currentTarget.src = "/placeholder.png")}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Sin imagen</span>
          </div>
        )}

        {!cartItem && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}
            className="absolute bottom-2 right-2 w-8 h-8 bg-card border border-border text-foreground rounded-full text-lg shadow flex items-center justify-center hover:bg-muted z-10"
          >
            +
          </button>
        )}

        {cartItem && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2 right-2 bg-card border border-border text-foreground rounded-full shadow flex items-center px-2 py-1 gap-2 z-10"
          >
            <button
              onClick={() => handleUpdate(cartItem.quantity - 1)}
              className="w-6 h-6 rounded-full border text-sm flex items-center justify-center hover:bg-muted"
            >
              –
            </button>
            <span className="text-sm font-semibold">{cartItem.quantity}</span>
            <button
              onClick={() => handleUpdate(cartItem.quantity + 1)}
              className="w-6 h-6 rounded-full border text-sm flex items-center justify-center hover:bg-muted"
              disabled={showStockWarning}
            >
              +
            </button>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="text-base font-semibold leading-tight flex gap-2 items-center flex-wrap min-w-0">
          {product.is_offer && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
              🔥 OFERTA
            </span>
          )}
        </h3>

        <h3 className="text-base font-semibold leading-tight flex gap-2 items-center flex-wrap min-w-0">
          {capitalize(product.name)}
        </h3>

        <div className="text-lg font-bold text-primary leading-tight">
          ${discountedPrice.toLocaleString()}
          {!!product.discount && product.discount > 0 && (
            <span className="text-sm line-through ml-2 text-muted-foreground">
              ${product.price.toLocaleString()}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {product.unit} · $ {discountedPrice.toLocaleString()}/{product.unit}
        </p>

        {showStockWarning && (
          <p className="text-xs text-red-600 mt-1">
            ❗ Máximo disponible: {product.stock}
          </p>
        )}

        <button
          onClick={() => setOpen(true)}
          className="mt-2 text-xs self-start text-muted-foreground underline hover:text-primary cursor-pointer"
        >
          Ver detalles
        </button>
      </div>

      {open && (
        <ProductDetailsSheet
          product={product}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </div>
  );
}
