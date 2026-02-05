"use client";

import { usePathname } from "next/navigation";

export default function PatternGate() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <div className="bg-pattern" />;
}
