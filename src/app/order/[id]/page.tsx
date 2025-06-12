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
  created_at: string;
  status?: ORDER_STATUS;
  cancellation_reason?: string;
  canceled_by?: "admin" | "cliente";
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    unit: string;
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
        .select("*, products(name, unit, image_url)")
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
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-start mb-4">
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

      <p className="text-sm text-muted-foreground mb-1">
        Realizado: {new Date(order.created_at).toLocaleString()}
      </p>
      <p className="font-semibold">{order.customer_name}</p>
      <p className="text-sm text-muted-foreground mb-1">{order.email}</p>
      <p className="text-sm text-muted-foreground mb-4">{order.phone}</p>

      {order.status === ORDER_STATUS.CANCELLED && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
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

      <div className="border rounded p-4 mb-6">
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
        <p>
          <strong>Total:</strong> ${order.total.toFixed(2)}
        </p>
      </div>

      {order.payment_method === "transferencia" && (
        <div className="border rounded p-4 mb-6 bg-yellow-50">
          <h3 className="font-semibold mb-2 text-yellow-900">
            💳 Datos de transferencia
          </h3>
          <ul className="text-sm text-yellow-800 space-y-1">
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

      {order.status === ORDER_STATUS.PENDING && (
        <div className="mb-6">
          <Button
            className="cursor-pointer"
            variant="destructive"
            onClick={() => setShowCancelDialog(true)}
          >
            Cancelar pedido
          </Button>
        </div>
      )}

      <h2 className="text-xl font-bold mb-2">Productos:</h2>
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
              />
            </div>

            <div>
              <p className="font-medium">
                {item.products.name} x{item.quantity} ({item.products.unit})
              </p>
              <p className="text-sm text-muted-foreground">
                ${item.price.toFixed(2)} c/u
              </p>
            </div>
          </li>
        ))}
      </ul>

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
              className="cursor-pointer"
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Volver
            </Button>
            <Button
              className="cursor-pointer"
              variant="destructive"
              onClick={handleCancelOrder}
            >
              Cancelar pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
