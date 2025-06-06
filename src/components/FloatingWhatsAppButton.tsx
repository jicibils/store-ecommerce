// src/components/FloatingWhatsAppButton.tsx
"use client";

import Link from "next/link";
import { CONTACT_PHONE } from "@/lib/constants";

export default function FloatingWhatsAppButton() {
  const message = "Hola! Quisiera hacer una consulta sobre mi pedido.";

  if (!CONTACT_PHONE) return null; // No renderiza si no hay número

  return (
    <Link
      href={`https://wa.me/${CONTACT_PHONE}?text=${encodeURIComponent(
        message
      )}`}
      target="_blank"
      aria-label="Chatear por WhatsApp"
      className="fixed bottom-20 right-4 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all cursor-pointer z-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12.04 2C6.55 2 2.05 6.5 2.05 12c0 2.05.62 3.96 1.7 5.55L2 22l4.6-1.73c1.53.84 3.28 1.28 5.1 1.28 5.49 0 9.95-4.5 9.95-10S17.53 2 12.04 2zm0 18.17c-1.54 0-3.04-.41-4.35-1.18l-.31-.18-2.73 1 .93-2.83-.18-.3C4.48 15.27 4 13.66 4 12c0-4.43 3.61-8.03 8.04-8.03s8.03 3.6 8.03 8.03-3.6 8.04-8.03 8.04zm4.42-6.13c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.23-.62.78-.76.94-.14.16-.28.17-.52.06-.24-.12-1.03-.38-1.97-1.22-.73-.65-1.22-1.45-1.36-1.7-.14-.24-.02-.37.1-.49.1-.1.23-.26.34-.4.12-.14.16-.23.24-.38.08-.16.04-.3-.02-.42-.07-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.23-.84.82-.84 2s.86 2.33.98 2.49c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.5.58.18 1.1.15 1.5.09.46-.07 1.42-.58 1.62-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28z" />
      </svg>
    </Link>
  );
}
