// src/app/thanks/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

export default function ThanksPage() {
  const router = useRouter();
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
      router.push("/");
    }, seconds * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [router, seconds]);

  return (
    <div className="max-w-2xl mx-auto p-6 text-center space-y-6">
      <h1 className="text-3xl font-bold">¡Gracias por tu pedido! 🎉</h1>
      <p className="text-muted-foreground text-lg">
        Tu orden fue recibida correctamente. Te estaremos contactando pronto
        para coordinar la entrega 📦
      </p>

      <p className="text-sm text-muted-foreground">
        Serás redirigido automáticamente en{" "}
        <span className="font-semibold">{seconds}</span> segundos...
      </p>

      <Link
        href="/"
        className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-white hover:text-black border border-black transition"
      >
        Volver a la tienda 🛒
      </Link>
    </div>
  );
}
