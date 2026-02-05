"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import Logo from "./Logo";
import LeftMenu from "./LeftMenu";
import AdminBackButton from "./AdminBackButton";

export default function Navbar() {
  const { cart } = useCart();
  const [dark, setDark] = useState(true);
  const pathname = usePathname();

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

  if (pathname === "/") return null;

  return (
    <nav className="w-full px-6 py-3 flex justify-between items-center bg-background border-b border-border sticky top-0 z-50">
      {/* Left menu */}
      <LeftMenu />
      <AdminBackButton />

      {/* Center logo */}
      <Link
        href="/"
        className="flex items-center gap-2 text-xl font-bold text-primary absolute left-1/2 transform -translate-x-1/2"
      >
        <Logo size={100} />
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
          className="hidden hover:text-primary transition"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </nav>
  );
}
