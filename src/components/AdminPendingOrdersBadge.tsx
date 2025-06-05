"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ORDER_STATUS } from "@/lib/constants";

export default function AdminPendingOrdersBadge() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cargar sonido
  useEffect(() => {
    audioRef.current = new Audio("/sounds/noti.mp3");
  }, []);

  // Fetch de pedidos pendientes cada 30s
  useEffect(() => {
    const fetchPendingCount = async () => {
      const { count, error } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", ORDER_STATUS.PENDING);

      if (error || count === null) return;

      // Reproducir si hay nuevos pedidos y el sonido está activo
      if (
        audioEnabled &&
        prevCountRef.current !== 0 &&
        count > prevCountRef.current
      ) {
        audioRef.current
          ?.play()
          .catch((e) => console.error("🔇 Error al reproducir sonido:", e));
      }

      prevCountRef.current = count;
      setCount(count);
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [audioEnabled]);

  return (
    <div className="relative flex items-center gap-2">
      {/* Badge visible siempre que haya pedidos */}
      {count > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
          {count}
        </span>
      )}

      {/* Botón para activar sonido, una sola vez */}
      {!audioEnabled && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // evita que el click afecte navegación
            e.preventDefault(); // evita redirección de Link
            setAudioEnabled(true);
            audioRef.current?.play().catch(() => {});
          }}
          className="text-[10px] underline text-muted-foreground hover:text-primary transition"
        >
          🔊 sonido
        </button>
      )}
    </div>
  );
}
