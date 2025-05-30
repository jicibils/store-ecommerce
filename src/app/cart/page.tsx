"use client";

import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Tu carrito</h1>

      {cart.length === 0 ? (
        <p className="text-gray-600">El carrito está vacío.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 border p-4 rounded-lg"
              >
                <div className="relative w-20 h-20">
                  {item.image_url && (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                      placeholder="blur"
                      blurDataURL="/placeholder.png"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Cantidad: {item.quantity}
                  </p>
                  <p className="text-sm text-gray-800">
                    Precio: ${item.price.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 text-sm underline"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <p className="text-xl font-bold">
              Total: ${total.toLocaleString()}
            </p>
            <div className="flex gap-4 mt-4">
              <Link
                href="/checkout"
                className="bg-black text-white px-4 py-2 rounded"
              >
                Ir al checkout
              </Link>
              <button onClick={clearCart} className="text-red-600 underline">
                Vaciar carrito
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
