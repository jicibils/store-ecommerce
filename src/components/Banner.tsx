// src/components/Banner.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SOCIAL_LINKS, MIN_INSTAGRAM } from "@/lib/constants";

interface Banner {
  id: string;
  message: string;
  type?: "info" | "warning" | "success";
  minAmount?: number;
  subMessage: string;
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
          "📲 Mirá nuestras historias en Instagram: si nos seguís, te enterás cuando hay envío gratis.",
        type: "success",
        minAmount: 0,
        subMessage: `Seguinos acá → ${MIN_INSTAGRAM}`,
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

  const visiblePrefixes = ["/fruver", "/sales"];
  // const visiblePrefixes = ["/fruver", "/market", "/sales"];
  if (!visiblePrefixes.some((prefix) => pathname.startsWith(prefix)))
    return null;

  if (visibles.length === 0) return null;

  return (
    <div className="relative z-1 space-y-2 mb-4">
      {visibles.map((b) => (
        <div
          key={b.id}
          className={`text-center rounded p-2 border shadow-sm
        ${
          b.type === "success"
            ? "bg-green-100 text-green-800 border-green-300"
            : b.type === "warning"
              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
              : "bg-blue-100 text-blue-800 border-blue-300"
        }
      `}
        >
          <p className="text-base font-semibold">{b.message}</p>
          <p className="text-sm text-muted-foreground mt-1">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium hover:text-green-700"
            >
              {b.subMessage}
            </a>
          </p>{" "}
        </div>
      ))}
    </div>
  );
}
