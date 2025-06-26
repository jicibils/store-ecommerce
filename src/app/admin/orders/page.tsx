/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { FINAL_STATUSES, ORDER_STATUSES, STATUS_COLORS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/sendOrderConfirmationEmail";
import { Button } from "@/components/ui/button";
import CancelOrderDialog from "@/components/CancelOrderDialog";
import AuditReasonModal from "@/components/AuditReasonModal";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { formatDateToAR, normalizePhone } from "@/lib/utils";

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
      .select("*, product:product_id(*, unit:unit_id(label))");

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
          <div className="flex gap-2 items-center relative z-1">
            <Button onClick={handleExport}>Exportar CSV</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6 ">
          <div>
            <label className="block mb-1 font-medium">
              Filtrar por método de pago:
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="border px-3 py-2 rounded w-full bg-white relative z-1"
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
              className="border px-3 py-2 rounded w-full bg-white relative z-1"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Filtrar por estado:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border px-3 py-2 rounded w-full bg-white relative z-1"
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const shortId = order.id.slice(0, 8);
              const orderUrl = `${window.location.origin}/order/${order.id}`;
              const rawMessage = `Hola ${order.customer_name}, tu Pedido #${shortId} 📦 está siendo preparado. Podés ver el detalle en: ${orderUrl} ¡Gracias por tu compra! 🙌🥑🍎`;
              const message = encodeURIComponent(rawMessage.normalize("NFC"));
              const cancelMsg = encodeURIComponent(
                `Hola ${
                  order.customer_name
                }, lamentamos informarte que tu Pedido #${shortId} 📦 fue cancelado. Motivo: ${
                  order.cancellation_reason || "no especificado"
                }. Si tenés dudas podés escribirnos. Detalle aquí: ${orderUrl}`
              );
              const phone = normalizePhone(order.phone);

              return (
                <div
                  key={order.id}
                  className="border rounded-lg p-0 shadow-md bg-white dark:bg-zinc-900 flex flex-col justify-between h-full relative z-1"
                >
                  {/* HEADER */}
                  <div className="bg-muted px-4 py-3 flex justify-between items-start border-b">
                    <div className="text-sm space-y-1">
                      <Link
                        href={`/order/${order.id}`}
                        target="_blank"
                        className="font-semibold text-base flex items-center gap-1 text-primary cursor-pointer"
                      >
                        Pedido #{shortId} 📦
                      </Link>
                      <p className="font-semibold text-sm">
                        {order.customer_name}
                      </p>
                      <p className="text-muted-foreground">{order.address}</p>
                      {order.address_details && (
                        <p className="text-muted-foreground text-xs">
                          {order.address_details}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-green-700 text-xs">
                        <WhatsAppIcon className="w-4 h-4" />
                        <a
                          href={`https://api.whatsapp.com/send?phone=${phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline cursor-pointer"
                        >
                          {order.phone}
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        💳 {order.payment_method}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2 py-1 rounded-full font-semibold h-fit whitespace-nowrap ${
                        STATUS_COLORS[order.status]
                      }`}
                    >
                      {
                        ORDER_STATUSES.find((s) => s.value === order.status)
                          ?.label
                      }
                    </span>
                  </div>

                  {/* PRODUCTOS */}
                  <div className="overflow-y-auto max-h-44 p-4">
                    <ul className="text-sm space-y-2">
                      {orderItems
                        .filter((i) => i.order_id === order.id)
                        .map((item) => (
                          <li key={item.id}>
                            <div className="flex justify-between font-medium">
                              <span>{item.product?.name}</span>
                              <span>
                                ${(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} unidad - {"("}
                              {item.product?.unit?.label ?? "—"}
                              {")"} - ${item.price} c/u
                            </p>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* FOOTER */}
                  <div className="border-t px-4 py-3 text-sm space-y-2">
                    <p className="font-bold text-lg text-green-700">
                      Total: ${order.total.toLocaleString()}
                    </p>

                    <div className="flex justify-between items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className="text-sm border rounded px-2 py-1 cursor-pointer"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>

                      {order.status === "confirmed" && (
                        <a
                          href={`https://api.whatsapp.com/send?phone=${phone}&text=${message}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-600 text-xs underline whitespace-nowrap cursor-pointer"
                        >
                          <WhatsAppIcon className="w-4 h-4" /> Enviar
                          confirmación
                        </a>
                      )}

                      {order.status === "cancelled" && (
                        <a
                          href={`https://api.whatsapp.com/send?phone=${phone}&text=${cancelMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-red-600 text-xs underline whitespace-nowrap cursor-pointer"
                        >
                          <WhatsAppIcon className="w-4 h-4" /> Enviar
                          cancelación
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      {!FINAL_STATUSES.includes(order.status) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => {
                            setPendingStatusChange({
                              orderId: order.id,
                              oldStatus: order.status,
                              newStatus: "cancelled",
                            });
                            setShowCancelDialog(true);
                          }}
                        >
                          Cancelar pedido
                        </Button>
                      )}

                      {order.confirm_method === "email" && order.email && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="cursor-pointer"
                          onClick={async () => {
                            const toastId = toast.loading("Enviando email...");
                            try {
                              await sendOrderConfirmationEmail({
                                name: order.customer_name,
                                email: order.email,
                                orderUrl: orderUrl,
                              });
                              toast.success(
                                "📩 Email reenviado correctamente",
                                { id: toastId }
                              );
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

                    <p className="text-muted-foreground text-xs pt-2">
                      Pedido creado el{" "}
                      {/* {new Date(order.created_at).toLocaleString()} */}
                      {formatDateToAR(order.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <CancelOrderDialog
              open={showCancelDialog}
              onClose={() => {
                setShowCancelDialog(false);
                setPendingStatusChange(null);
              }}
              onConfirm={async (reason) => {
                if (!pendingStatusChange) return;
                const toastId = toast.loading("Cancelando pedido...");
                setLoading(true);

                const { error } = await supabase
                  .from("orders")
                  .update({
                    status: pendingStatusChange.newStatus,
                    cancellation_reason: reason,
                    canceled_by: "admin",
                  })
                  .eq("id", pendingStatusChange.orderId);

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
                setPendingStatusChange(null);
                setLoading(false);
              }}
            />
          </div>
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
