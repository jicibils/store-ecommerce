"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminBackButton() {
  const pathname = usePathname();
  const isInAdmin = pathname.startsWith("/admin") && pathname !== "/admin";

  if (!isInAdmin) return null;

  return (
    <div className="fixed top-3 left-20 z-50">
      <Link href="/admin">
        <Button
          variant="outline"
          className="text-sm px-3 py-1 h-auto cursor-pointer"
        >
          ↩ Volver al panel
        </Button>
      </Link>
    </div>
  );
}
