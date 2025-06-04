"use client";

import { useMemo } from "react";
import { Order } from "./page";

interface Props {
  orders: Order[];
}

export default function RevenueSplitReport({ orders }: Props) {
  const { total, socio, vos } = useMemo(() => {
    const total = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((acc, o) => acc + o.total, 0);

    const vos = total * 0.2;
    const socio = total * 0.8;

    return { total, vos, socio };
  }, [orders]);

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold mb-2">💸 División de ganancias</h2>
      <div className="border rounded bg-muted p-4 space-y-1">
        <p>
          Ventas válidas: <strong>${total.toFixed(2)}</strong>
        </p>
        <p>
          Nachin (20%):{" "}
          <strong className="text-green-700">${vos.toFixed(2)}</strong>
        </p>
        <p>
          Negrito (80%):{" "}
          <strong className="text-blue-700">${socio.toFixed(2)}</strong>
        </p>
      </div>
    </div>
  );
}
