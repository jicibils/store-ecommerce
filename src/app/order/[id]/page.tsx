"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  STATUS_COLORS,
  CONTACT_PHONE,
  ALIAS,
  CBU,
  TITULAR,
  CUIT,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getProxiedImagePath } from "@/lib/utils";
import ShippingMap from "@/components/ShippingMap";

interface Order {
  id: string;
  customer_name: string;
  address: string;
  address_details?: string;
  phone: string;
  email: string;
  delivery_option: string;
  payment_method: string;
  total: number;
  shipping_cost?: number | null;
  created_at: string;
  status?: ORDER_STATUS;
  cancellation_reason?: string;
  canceled_by?: "admin" | "cliente";
  destination_lat?: number | null;
  destination_lng?: number | null;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    unit: { label: string } | null;
    image_url: string;
  };
}

export default function OrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("No se pudo encontrar el pedido");
        return;
      }
      setOrder(data);

      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*, products(name, image_url, unit:unit_id(label))")
        .eq("order_id", id);

      if (!itemsError && orderItems) setItems(orderItems);
      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Por favor ingresa un motivo para cancelar el pedido");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status: ORDER_STATUS.CANCELLED,
        cancellation_reason: cancelReason,
        canceled_by: "cliente",
      })
      .eq("id", id);

    if (error) {
      toast.error("Error al cancelar el pedido");
    } else {
      toast.success("Pedido cancelado correctamente");
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: ORDER_STATUS.CANCELLED,
              cancellation_reason: cancelReason,
              canceled_by: "cliente",
            }
          : prev
      );
    }

    setShowCancelDialog(false);
  };

  if (loading) return <p className="text-center py-10">Cargando pedido...</p>;
  if (!order) return <p className="text-center py-10">Pedido no encontrado</p>;

  const whatsappURL = `https://wa.me/${CONTACT_PHONE}?text=${encodeURIComponent(
    `Hola! Te envío el comprobante de pago del pedido ${order.id.slice(0, 8)}.`
  )}`;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 relative z-1">
      {/* 🧾 Encabezado + estado */}
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold">
          Pedido #{order.id.slice(0, 8)} 📦
        </h1>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full ${
            STATUS_COLORS[order.status ?? ORDER_STATUS.PENDING]
          }`}
        >
          {ORDER_STATUS_LABELS[order.status ?? ORDER_STATUS.PENDING]}
        </span>
      </div>

      {/* 🧑 Datos del cliente + dirección */}
      <div className="bg-white rounded-xl shadow p-6 space-y-2">
        <p className="text-sm text-muted-foreground">
          Realizado: {new Date(order.created_at).toLocaleString()}
        </p>
        <p className="font-semibold">{order.customer_name}</p>
        <p className="text-sm text-muted-foreground">{order.email}</p>
        <p className="text-sm text-muted-foreground">{order.phone}</p>

        {order.status === ORDER_STATUS.CANCELLED && (
          <div className="bg-red-100 text-red-800 p-4 rounded mt-4">
            <p className="font-semibold mb-1">❌ Pedido cancelado</p>
            <p>
              <strong>Motivo:</strong>{" "}
              {order.cancellation_reason || "Sin motivo especificado"}
            </p>
            <p>
              <strong>Cancelado por:</strong>{" "}
              {order.canceled_by === "admin" ? "Administrador" : "Cliente"}
            </p>
          </div>
        )}

        <hr className="my-2" />
        <p>
          <strong>Dirección:</strong> {order.address}
        </p>
        {order.address_details && (
          <p>
            <strong>Detalles:</strong> {order.address_details}
          </p>
        )}
        <p>
          <strong>Envío:</strong> {order.delivery_option}
        </p>
        <p>
          <strong>Pago:</strong> {order.payment_method}
        </p>

        {order.destination_lat && order.destination_lng && (
          <div className="bg-white rounded-xl shadow p-4 mt-4">
            <h3 className="font-semibold mb-2">📍 Ubicación de entrega</h3>
            <div className="h-64 w-full rounded overflow-hidden">
              <ShippingMap
                coords={[order.destination_lng, order.destination_lat]}
                draggable={false}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Si la ubicación es incorrecta, por favor contáctanos.
            </p>
          </div>
        )}
        <div className="mt-4 bg-gray-50 rounded p-4 space-y-1">
          <p>
            <strong>Subtotal productos:</strong> ${order.total?.toFixed(2)}
          </p>
          <p>
            <strong>Costo de envío:</strong> $
            {Number(order.shipping_cost ?? 0).toFixed(2)}
          </p>
          <hr />
          <p className="font-semibold text-lg">
            <strong>Total final:</strong> $
            {(
              Number(order.total ?? 0) + Number(order.shipping_cost ?? 0)
            ).toFixed(2)}
          </p>
        </div>
      </div>

      {/* 💳 Transferencia */}
      {order.payment_method === "transferencia" && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 rounded-xl shadow p-6">
          <h3 className="font-semibold mb-2">💳 Datos de transferencia</h3>
          <ul className="text-sm space-y-1">
            <li>
              <strong>Alias:</strong> {ALIAS}
            </li>
            <li>
              <strong>CBU:</strong> {CBU}
            </li>
            <li>
              <strong>Titular:</strong> {TITULAR}
            </li>
            <li>
              <strong>CUIT:</strong> {CUIT}
            </li>
          </ul>

          <Button
            className="mt-4 cursor-pointer"
            variant="secondary"
            onClick={() => window.open(whatsappURL, "_blank")}
          >
            Enviar comprobante por WhatsApp
          </Button>
        </div>
      )}

      {/* 🛑 Botón de cancelar */}
      {order.status === ORDER_STATUS.PENDING && (
        <div className="text-center">
          <Button
            className="cursor-pointer"
            variant="destructive"
            onClick={() => setShowCancelDialog(true)}
          >
            Cancelar pedido
          </Button>
        </div>
      )}

      {/* 🛒 Lista de productos */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Productos:</h2>
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="border p-3 rounded flex items-center gap-4"
            >
              <div className="w-14 h-14 relative rounded overflow-hidden bg-muted shrink-0">
                <Image
                  src={getProxiedImagePath(item.products.image_url)}
                  alt={item.products.name}
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="/placeholder.png"
                  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                />
              </div>
              <div>
                <p className="font-medium">
                  {item.products.name} x{item.quantity} (
                  {item.products.unit?.label ?? "—"})
                </p>
                <p className="text-sm text-muted-foreground">
                  ${item.price.toFixed(2)} c/u
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 🔁 Modal de cancelación */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              ¿Estás seguro que querés cancelar el pedido?
            </DialogTitle>
          </DialogHeader>

          <Textarea
            placeholder="Motivo de la cancelación"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Volver
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder}>
              Cancelar pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
