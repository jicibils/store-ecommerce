// src/components/Banner.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface Banner {
  id: string;
  message: string;
  type?: "info" | "warning" | "success";
  minAmount?: number;
}

export default function Banner({ total = 0 }: { total?: number }) {
  const pathname = usePathname();

  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    // Acá podrías hacerlo dinámico desde Supabase si querés escalarlo
    const staticBanners: Banner[] = [
      {
        id: "free-shipping",
        message:
          "🚚 Envío gratis en compras mayores a $8000. Aprovechá esta promo!",
        type: "success",
        minAmount: 8000,
      },
      // Más banners futuros acá
    ];
    setBanners(staticBanners);
  }, []);

  const visibles = banners.filter((b) => {
    if (b.minAmount && total < b.minAmount) return true;
    if (!b.minAmount) return true;
    return false;
  });

  if (pathname !== "/") return null;

  if (visibles.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visibles.map((b) => (
        <div
          key={b.id}
          className={`text-center text-sm rounded p-2 border shadow-sm
            ${
              b.type === "success"
                ? "bg-green-100 text-green-800 border-green-300"
                : b.type === "warning"
                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                : "bg-blue-100 text-blue-800 border-blue-300"
            }
          `}
        >
          {b.message}
        </div>
      ))}
    </div>
  );
}
