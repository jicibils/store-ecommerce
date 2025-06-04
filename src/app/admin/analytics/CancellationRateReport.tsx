"use client";

import { useMemo } from "react";
import { Order } from "./page";

interface Props {
  orders: Order[];
}

export default function CancellationRateReport({ orders }: Props) {
  const { total, cancelled, percentage } = useMemo(() => {
    const total = orders.length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    const percentage = total > 0 ? (cancelled / total) * 100 : 0;
    return { total, cancelled, percentage };
  }, [orders]);

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold mb-2">📉 Tasa de cancelación</h2>
      <div className="border rounded bg-muted p-4 space-y-1">
        <p>
          Total de pedidos: <strong>{total}</strong>
        </p>
        <p>
          Cancelados: <strong>{cancelled}</strong>
        </p>
        <p>
          Tasa de cancelación:{" "}
          <strong className="text-red-600">{percentage.toFixed(1)}%</strong>
        </p>
      </div>
    </div>
  );
}
