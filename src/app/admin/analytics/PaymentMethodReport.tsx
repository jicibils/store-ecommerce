"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

interface Order {
  id: string;
  payment_method: string;
}

interface Props {
  orders: Order[];
}

const COLORS = [
  "#16a34a",
  "#4f46e5",
  "#eab308",
  "#ef4444",
  "#6366f1",
  "#14b8a6",
];

export default function PaymentMethodReport({ orders }: Props) {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const grouped: Record<string, number> = {};

    for (const order of orders) {
      const method = order.payment_method || "Otro";
      grouped[method] = (grouped[method] || 0) + 1;
    }

    const chartData = Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }));

    setData(chartData);
    setLoading(false);
  }, [orders]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">💳 Método de pago</h2>
      {loading ? (
        <p className="flex items-center gap-2">
          <Loader2 className="animate-spin w-4 h-4" /> Cargando...
        </p>
      ) : data.length === 0 ? (
        <p>No hay datos de pagos este mes.</p>
      ) : (
        <>
          <div className="bg-background border rounded p-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.map((item, index) => (
              <li
                key={item.name}
                className="border p-3 rounded flex items-center gap-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>
                  {item.name} – {item.value} (
                  {((item.value / orders.length) * 100).toFixed(1)}%)
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
