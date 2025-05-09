// src/app/admin/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  ClipboardList,
  Settings,
  Plus,
  ChartArea,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminDashboardPage() {
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

  const actions = [
    {
      icon: <Plus className="w-6 h-6" />,
      label: "Cargar producto",
      href: "/admin/products",
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      label: "Ver pedidos",
      href: "/admin/orders",
    },
    {
      icon: <ChartArea className="w-6 h-6" />,
      label: "Reportes (Próximamente)",
      href: "/admin/analytics",
    },
    {
      icon: <Settings className="w-6 h-6" />,
      label: "Configuración",
      href: "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen px-6 py-10 bg-background text-foreground">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de administración</h1>
        <Button variant="ghost" onClick={toggleTheme}>
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="ml-2 text-sm">
            {dark ? "Modo claro" : "Modo oscuro"}
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action) => (
          <Link href={action.href} key={action.href}>
            <div className="border rounded-lg p-6 hover:bg-accent transition shadow flex items-center gap-4 cursor-pointer">
              <div className="text-primary">{action.icon}</div>
              <span className="text-lg font-medium">{action.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
