// src/app/order/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Order {
  id: string;
  customer_name: string;
  address: string;
  phone: string;
  email: string;
  delivery_option: string;
  payment_method: string;
  total: number;
  created_at: string;
}

interface OrderItem {
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

  if (loading) return <p className="text-center py-10">Cargando pedido...</p>;
  if (!order) return <p className="text-center py-10">Pedido no encontrado</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Pedido #{order.id.slice(0, 8)} 📦
      </h1>

      <p className="text-sm text-muted-foreground mb-1">
        Realizado: {new Date(order.created_at).toLocaleString()}
      </p>
      <p className="font-semibold">{order.customer_name}</p>
      <p className="text-sm text-muted-foreground mb-1">{order.email}</p>
      <p className="text-sm text-muted-foreground mb-4">{order.phone}</p>

      <div className="border rounded p-4 mb-6">
        <p>
          <strong>Dirección:</strong> {order.address}
        </p>
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

      <h2 className="text-xl font-bold mb-2">Productos:</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="border p-3 rounded flex items-center gap-4"
          >
            <Image
              src={item.products.image_url}
              alt={item.products.name}
              width={64}
              height={64}
              className="object-cover rounded border"
              placeholder="blur"
              blurDataURL="/placeholder.png"
            />
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
    </div>
  );
}
