"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const { cart } = useCart();
  const quantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="flex justify-between items-center px-4 py-3 border-b">
      <Link href="/" className="font-bold text-xl">
        Mi Tienda
      </Link>
      <Link href="/cart" className="relative">
        🛒
        {quantity > 0 && (
          <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
            {quantity}
          </span>
        )}
      </Link>
    </nav>
  );
}
