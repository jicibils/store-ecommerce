/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import {
  FINAL_STATUSES,
  ORDER_STATUS,
  ORDER_STATUSES,
  STATUS_COLORS,
} from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/sendOrderConfirmationEmail";
import { Button } from "@/components/ui/button";
import CancelOrderDialog from "@/components/CancelOrderDialog";
import AuditReasonModal from "@/components/AuditReasonModal";

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
      Detalles: order.address_details,
      Telefono: order.phone,
      Email: order.email,
      Delivery: order.delivery_option,
      Pago: order.payment_method,
      Notificacion: order.confirm_method,
      Status: order.status,
      Razon_de_cancelamiento: order.cancellation_reason,
      Cancelado_por: order.canceled_by,
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
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    orderId: string;
    oldStatus: string;
    newStatus: string;
  } | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: o } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: oi } = await supabase
      .from("order_items")
      .select("*, product:product_id(*)");

    setOrders(o || []);
    setOrderItems(oi || []);
    setLoading(false);
  };

  useEffect(() => {
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
    const matchesStatus = statusFilter ? order.status === statusFilter : true;

    return matchesPayment && matchesDate && matchesStatus;
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const oldStatus = order.status;

    if (FINAL_STATUSES.includes(oldStatus) && oldStatus !== newStatus) {
      setPendingStatusChange({ orderId, oldStatus, newStatus });
      setShowAuditModal(true);
      return;
    }

    await updateStatus(orderId, newStatus);
  };

  const updateStatus = async (
    orderId: string,
    newStatus: string,
    reason?: string
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Error al actualizar estado");
      return;
    }

    // Guardar auditoría si hay motivo
    if (reason) {
      await supabase.from("order_status_audit").insert({
        order_id: orderId,
        old_status: order.status,
        new_status: newStatus,
        reason,
        changed_by: "admin",
      });
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    toast.success("Estado actualizado");
  };

  return (
    <div className={"bg-background text-foreground min-h-screen p-6"}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pedidos recibidos</h1>
          <div className="flex gap-2 items-center">
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
              className="border px-3 py-2 rounded w-full"
            >
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Filtrar por fecha:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Filtrar por estado:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="">Todos</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const items = orderItems?.filter((i) => i.order_id === order.id);

            return (
              <div key={order.id} className="mb-6 border rounded-lg p-4 shadow">
                <div className="mb-2 flex justify-between items-start">
                  <div>
                    <p>
                      <strong>Cliente:</strong> {order.customer_name}
                    </p>
                    <div>
                      <p>
                        <strong>{order.address}</strong>
                      </p>
                      {order.address_details && (
                        <p className="text-sm text-muted-foreground">
                          {order.address_details}
                        </p>
                      )}
                    </div>{" "}
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

                  <div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        STATUS_COLORS[order.status]
                      }`}
                    >
                      {
                        ORDER_STATUSES.find((s) => s.value === order.status)
                          ?.label
                      }
                    </span>
                    <select
                      className="mt-2 block text-sm border px-2 py-1 rounded"
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
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
                  <div className="pt-5">
                    <Link href={`/order/${order.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        Ver orden
                      </Button>
                    </Link>
                    {order.confirm_method === "email" && order.email && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2 ml-2 cursor-pointer"
                        onClick={async () => {
                          const toastId = toast.loading("Enviando email...");
                          try {
                            await sendOrderConfirmationEmail({
                              name: order.customer_name,
                              email: order.email,
                              orderUrl: `${window.location.origin}/order/${order.id}`,
                            });
                            toast.success("📩 Email reenviado correctamente", {
                              id: toastId,
                            });
                          } catch (err) {
                            toast.error("❌ No se pudo reenviar el email", {
                              id: toastId,
                            });
                            console.log(err);
                          }
                        }}
                      >
                        Reenviar email
                      </Button>
                    )}
                  </div>
                </div>
                {order.status === "cancelled" && (
                  <div className="mt-2 p-4 bg-red-100 text-red-800 rounded">
                    <p className="font-semibold">❌ Pedido cancelado</p>
                    <p>
                      <strong>Motivo:</strong>{" "}
                      {order.cancellation_reason || "Sin motivo especificado"}
                    </p>
                    <p>
                      <strong>Cancelado por:</strong>{" "}
                      {order.canceled_by === "admin"
                        ? "Administrador"
                        : "Cliente"}
                    </p>
                  </div>
                )}
                {order.status === ORDER_STATUS.PENDING && (
                  <Button
                    variant="destructive"
                    className="cursor-pointer mt-2"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    Cancelar pedido
                  </Button>
                )}
                <CancelOrderDialog
                  open={showCancelDialog}
                  onClose={() => setShowCancelDialog(false)}
                  onConfirm={async (reason) => {
                    const toastId = toast.loading("Cancelando pedido...");
                    setLoading(true);

                    const { error } = await supabase
                      .from("orders")
                      .update({
                        status: "cancelled",
                        cancellation_reason: reason,
                        canceled_by: "admin",
                      })
                      .eq("id", order.id);

                    if (error) {
                      toast.error("Error al cancelar el pedido", {
                        id: toastId,
                      });
                      setLoading(false);
                      return;
                    }

                    await fetchData();

                    toast.success("Pedido cancelado", { id: toastId });
                    setShowCancelDialog(false);
                    setLoading(false);
                  }}
                />
              </div>
            );
          })
        ) : (
          <p>No hay pedidos.</p>
        )}
      </div>
      <AuditReasonModal
        open={showAuditModal}
        oldStatus={pendingStatusChange?.oldStatus || ""}
        newStatus={pendingStatusChange?.newStatus || ""}
        onClose={() => {
          setShowAuditModal(false);
          setPendingStatusChange(null);
        }}
        onConfirm={async (reason) => {
          if (pendingStatusChange) {
            await updateStatus(
              pendingStatusChange.orderId,
              pendingStatusChange.newStatus,
              reason
            );
            setShowAuditModal(false);
            setPendingStatusChange(null);
          }
        }}
      />
    </div>
  );
}
