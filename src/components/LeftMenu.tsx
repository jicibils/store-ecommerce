// src/components/LeftMenu.tsx
"use client";
import Link from "next/link";
import { Home, Menu, ShoppingCart, Leaf, Percent } from "lucide-react";
import {
  Sheet,
  SheetTitle,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet";
import Logo from "./Logo";

export default function LeftMenu() {
  const navLinks = [
    { label: "Inicio", href: "/", icon: <Home className="w-5 h-5" /> },
    {
      label: "Fruver",
      href: "/fruver",
      icon: <Leaf className="w-5 h-5" />,
    },
    {
      label: "Ofertas",
      href: "/sales",
      icon: <Percent className="w-5 h-5" />,
    },
    {
      label: "Market",
      href: "/market",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="hover:text-primary transition cursor-pointer"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <SheetTitle className="text-lg font-bold flex">
            <Logo />
            <span className="pt-2">Menú</span>
          </SheetTitle>
        </div>
        <ul className="flex flex-col">
          {navLinks.map(({ label, href, icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-2 px-4 py-3 hover:bg-muted text-sm"
              >
                {icon}
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
