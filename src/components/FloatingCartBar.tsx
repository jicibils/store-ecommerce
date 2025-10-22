"use client";

import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

export default function FloatingCartBar() {
  const { cart } = useCart();
  const pathname = usePathname();

  if (cart.length === 0) return null;

  // const visiblePrefixes = ["/fruver", "/market", "/sales", "/search"];
  const visiblePrefixes = ["/fruver", "/sales", "/search"];

  if (!visiblePrefixes.some((prefix) => pathname.startsWith(prefix)))
    return null;

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const items = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 
  bg-white/90 dark:bg-black/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl 
  border border-gray-300 dark:border-white/10 flex items-center justify-between gap-4"
    >
      <span className="text-sm font-medium text-black dark:text-white">
        🛒 {items} producto{items > 1 ? "s" : ""} – ${total.toLocaleString()}
      </span>

      <Link
        href="/checkout"
        className="bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold 
    hover:bg-green-700 transition whitespace-nowrap"
      >
        Ir al carrito →
      </Link>
    </div>
  );
}
