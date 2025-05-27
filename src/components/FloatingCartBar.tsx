"use client";

import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

export default function FloatingCartBar() {
  const { cart } = useCart();
  const pathname = usePathname();

  if (cart.length === 0) return null;
  if (pathname === "/checkout") return null;

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const items = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed bottom-0 sm:bottom-4 w-full sm:w-auto sm:left-1/2 sm:transform sm:-translate-x-1/2 z-50 bg-muted text-foreground px-4 sm:px-6 py-3 sm:rounded-full shadow-lg ring-1 ring-border flex items-center justify-between sm:gap-4">
      <span>
        🛒 {items} producto{items > 1 ? "s" : ""} – ${total.toLocaleString()}
      </span>
      <Link
        href="/checkout"
        className="bg-white text-black px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-100 transition"
      >
        Ir al carrito
      </Link>
    </div>
  );
}
