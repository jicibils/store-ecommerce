// src/app/admin/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  Settings,
  Plus,
  ChartArea,
  List,
  MessageCircleMore,
} from "lucide-react";
import { toast } from "sonner";
import AdminPendingOrdersBadge from "@/components/AdminPendingOrdersBadge";
import AdminInquiriesBadge from "@/components/AdminInquiriesBadge";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/logout"); // Hace GET a la ruta
      toast.success("👋 Sesión cerrada");
      router.push("/admin/login");
    } catch (e) {
      console.log(e);
      toast.error("Error al cerrar sesión");
    } finally {
      setLoading(false);
    }
  };

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
      badge: <AdminPendingOrdersBadge />,
    },
    {
      icon: <ChartArea className="w-6 h-6" />,
      label: "Reportes",
      href: "/admin/analytics",
    },
    {
      icon: <Settings className="w-6 h-6" />,
      label: "Configuración",
      href: "/admin/settings",
    },
    {
      icon: <MessageCircleMore className="w-6 h-6" />,
      label: "Consultas",
      href: "/admin/inquiries",
      badge: <AdminInquiriesBadge />,
    },
  ];

  return (
    <div className="min-h-screen px-6 py-10 bg-background text-foreground">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de administración</h1>
        <button
          onClick={handleLogout}
          disabled={loading}
          className={`relative z-1 px-4 py-2 rounded-md transition font-semibold border
    ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    bg-black text-white border-black hover:bg-white hover:text-black
    dark:bg-white dark:text-black dark:border-white dark:hover:bg-black dark:hover:text-white
  `}
        >
          {loading ? "Saliendo..." : "Cerrar sesión"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map(({ icon, label, href, badge }) => (
          <Link href={href} key={href}>
            <div className="relative z-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/20 rounded-xl p-6 hover:bg-accent transition shadow flex items-center gap-4 cursor-pointer">
              <div className="text-primary">{icon}</div>
              <span className="text-lg font-medium">{label}</span>
              {/* Badge */}
              {badge && <div className="absolute top-2 right-2">{badge}</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
