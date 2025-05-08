/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function generateCSV(orders: any[], orderItems: any[]) {
  if (!orders.length || !orderItems.length) {
    return "";
  }

  const rows = orders.map((order) => {
    const items = orderItems.filter((i) => i.order_id === order.id);
    const productos = items
      .map((i) => `${i.product?.name} x${i.quantity}`)
      .join("; ");
    return {
      Fecha: new Date(order.created_at).toLocaleDateString(),
      Hora: new Date(order.created_at).toLocaleTimeString(),
      Cliente: order.customer_name,
      Direccion: order.address,
      Telefono: order.phone,
      Email: order.email,
      Delivery: order.delivery_option,
      Pago: order.payment_method,
      Notificacion: order.confirm_method,
      Total: order.total,
      Productos: productos,
    };
  });

  const header = Object.keys(rows[0]).join(",");
  const data = rows.map((r) => Object.values(r).join(",")).join("\n");
  return `${header}\n${data}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [dark, setDark] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: o } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: oi } = await supabase
        .from("order_items")
        .select("*, product:product_id(*)");

      setOrders(o || []);
      setOrderItems(oi || []);
    }
    fetchData();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesPayment = paymentFilter
      ? order.payment_method === paymentFilter
      : true;
    const matchesDate = dateFilter
      ? new Date(order.created_at).toDateString() ===
        new Date(dateFilter).toDateString()
      : true;
    return matchesPayment && matchesDate;
  });

  const handleExport = () => {
    if (!filteredOrders.length) {
      toast.warning("No hay pedidos para exportar");
      return;
    }

    const csv = generateCSV(filteredOrders, orderItems);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "pedidos.csv");
    toast.success("CSV exportado");
  };

  return (
    <div
      className={`${
        dark ? "bg-black text-white" : "bg-white text-black"
      } min-h-screen p-6`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pedidos recibidos</h1>
          <div className="flex gap-2 items-center">
            <Button onClick={() => setDark(!dark)}>
              {dark ? "Light" : "Dark"} mode
            </Button>
            <Button onClick={handleExport}>Exportar CSV</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-1 font-medium">
              Filtrar por método de pago:
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="border px-3 py-2 rounded w-full text-black"
            >
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="mercado_pago">Mercado Pago</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Filtrar por fecha:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border px-3 py-2 rounded w-full text-black"
            />
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const items = orderItems?.filter((i) => i.order_id === order.id);

            return (
              <div key={order.id} className="mb-6 border rounded-lg p-4 shadow">
                <div className="mb-2">
                  <p>
                    <strong>Cliente:</strong> {order.customer_name}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {order.address}
                  </p>
                  <p>
                    <strong>Pago:</strong> {order.payment_method}
                  </p>
                  <p>
                    <strong>Total:</strong> ${order.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="border-t pt-2 mt-2">
                  <p className="font-semibold mb-2">Productos:</p>
                  <ul className="pl-4 list-disc space-y-1">
                    {items?.map((item) => (
                      <li key={item.id}>
                        {item.product?.name} x{item.quantity} – $
                        {item.price.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })
        ) : (
          <p>No hay pedidos.</p>
        )}
      </div>
    </div>
  );
}
