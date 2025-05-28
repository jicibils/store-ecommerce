// src/app/admin/page.tsx
"use client";

import Link from "next/link";
import { ClipboardList, Settings, Plus, ChartArea, List } from "lucide-react";

export default function AdminDashboardPage() {
  const actions = [
    {
      icon: <Plus className="w-6 h-6" />,
      label: "Cargar producto",
      href: "/admin/product",
    },
    {
      icon: <List className="w-6 h-6" />,
      label: "Ver productos",
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
