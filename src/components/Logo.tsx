"use client";

import Image from "next/image";
import { useState } from "react";
import { LOGO } from "@/lib/constants";

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
};

const ASPECT_W = 1313;
const ASPECT_H = 536;

export default function Logo({
  size,
  className = "",
  priority = false,
}: Props) {
  const [src, setSrc] = useState(LOGO);

  // Modo size (compat)
  if (typeof size === "number") {
    const height = Math.round((size * ASPECT_H) / ASPECT_W);

    return (
      <Image
        src={src}
        alt="Fruvercom"
        width={size}
        height={height}
        priority={priority}
        className={className}
        onError={() => setSrc("/placeholder.png")}
      />
    );
  }

  // Modo responsive
  return (
    <div className={`relative ${className} aspect-[1313/536]`}>
      <Image
        src={src}
        alt="Fruvercom"
        fill
        priority={priority}
        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 520px, 560px"
        className="object-contain"
        onError={() => setSrc("/placeholder.png")}
      />
    </div>
  );
}
