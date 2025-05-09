"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import {
  ShoppingCart,
  Home,
  LayoutDashboard,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import { useEffect, useState } from "react";
import { APP_NAME, LOGO_EMOJI } from "@/lib/constants";
import {
  Sheet,
  SheetTitle,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet";

export default function Navbar() {
  const { cart } = useCart();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !dark;
    setDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newTheme);
  };

  const navLinks = [
    { label: "Inicio", href: "/", icon: <Home className="w-5 h-5" /> },
    {
      label: "Admin",
      href: "/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="w-full px-6 py-3 flex justify-between items-center bg-background border-b border-border sticky top-0 z-50">
      {/* Left menu */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="hover:text-primary transition" aria-label="Menu">
            <Menu className="w-6 h-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <SheetTitle className="text-lg font-bold">Menú</SheetTitle>
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

      {/* Center logo */}
      <Link
        href="/"
        className="text-xl font-bold text-primary absolute left-1/2 transform -translate-x-1/2"
      >
        {APP_NAME} {LOGO_EMOJI}
      </Link>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        <Link
          href="/checkout"
          className="relative flex items-center text-sm font-medium transition hover:text-primary"
        >
          <ShoppingCart className="w-5 h-5" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </Link>

        <button
          onClick={toggleTheme}
          className="hover:text-primary transition"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </nav>
  );
}
