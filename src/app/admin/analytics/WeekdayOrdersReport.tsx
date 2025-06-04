"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Order } from "./page";

interface Props {
  orders: Order[];
}

const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function WeekdayOrdersReport({ orders }: Props) {
  const data = useMemo(() => {
    const counts = Array(7).fill(0);

    for (const order of orders) {
      const date = new Date(order.created_at);
      const day = date.getDay(); // 0 = Domingo, 1 = Lunes...
      counts[day]++;
    }

    return counts.map((value, index) => ({
      day: days[index],
      cantidad: value,
    }));
  }, [orders]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">
        📅 Pedidos por día de la semana
      </h2>

      <div className="bg-background border rounded p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
