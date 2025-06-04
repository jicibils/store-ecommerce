"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Loader2 } from "lucide-react";
import capitalize from "lodash.capitalize";

interface ProductSales {
  product_id: string;
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
}

interface Props {
  orders: Order[];
}

type OrderItemWithProduct = {
  product_id: string;
  quantity: number;
  products: {
    name: string;
  } | null;
};

export default function ProductSalesReport({ orders }: Props) {
  const [data, setData] = useState<ProductSales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const orderIds = orders.map((o) => o.id);

      const { data, error } = await supabase
        .from("order_items")
        .select("product_id, quantity, products(name)")
        .in("order_id", orderIds);

      if (error || !data) {
        console.error("Error fetching sales data", error);
        setLoading(false);
        return;
      }

      const items = data.map(
        (item: {
          product_id: string;
          quantity: number;
          products: { name: string }[] | { name: string } | null;
        }) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          products: Array.isArray(item.products)
            ? item.products[0] ?? { name: "Desconocido" }
            : item.products,
        })
      ) as OrderItemWithProduct[];

      const grouped: Record<string, ProductSales> = {};

      for (const item of items) {
        const name = capitalize(item.products?.name) || "Producto";
        if (!grouped[item.product_id]) {
          grouped[item.product_id] = {
            product_id: item.product_id,
            name,
            quantity: 0,
          };
        }
        grouped[item.product_id].quantity += item.quantity;
      }

      const sorted = Object.values(grouped).sort(
        (a, b) => b.quantity - a.quantity
      );

      setData(sorted);
      setLoading(false);
    };

    if (orders.length > 0) {
      fetchData();
    } else {
      setLoading(false);
      setData([]);
    }
  }, [orders]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">🥇 Productos más vendidos</h2>
      {loading ? (
        <p className="flex items-center gap-2">
          <Loader2 className="animate-spin w-4 h-4" /> Cargando...
        </p>
      ) : data.length === 0 ? (
        <p>No hay productos vendidos en este mes.</p>
      ) : (
        <>
          <div className="bg-background border rounded p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.slice(0, 10)}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.map((p, i) => (
              <li key={p.product_id} className="border p-3 rounded">
                #{i + 1} - {capitalize(p.name)} ({p.quantity} vendidos)
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
