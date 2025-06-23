// src/components/Logo.tsx
"use client";

import { LOGO } from "@/lib/constants";
import Image from "next/image";

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src={LOGO}
      alt="Logo Verdulería"
      width={size}
      height={size}
      className="rounded-full"
      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
    />
  );
}
