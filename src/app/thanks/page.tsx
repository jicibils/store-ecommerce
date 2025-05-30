// src/app/thanks/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useRouter, useSearchParams } from "next/navigation";

export default function ThanksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [seconds, setSeconds] = useState(7);

  useEffect(() => {
    // 🎊 Confetti inicial
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // ⏱️ Contador de segundos
    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    // 🔁 Redirección
    const timeout = setTimeout(() => {
      router.push(`/order/${orderId}`);
    }, seconds * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 text-center space-y-6">
      <h1 className="text-3xl font-bold">¡Gracias por tu compra! 🎉</h1>
      <p className="text-muted-foreground text-lg">
        Ya recibimos tu orden y la estamos procesando. Podés ver todos los
        detalles en la siguiente pantalla 📦
      </p>

      <p className="text-sm text-muted-foreground">
        Serás redirigido automáticamente en{" "}
        <span className="font-semibold">{seconds}</span> segundos...
      </p>

      <Link
        href={`/order/${orderId}`}
        className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-white hover:text-black border border-black transition"
      >
        Ir a los detalles del pedido 🔍
      </Link>
    </div>
  );
}
