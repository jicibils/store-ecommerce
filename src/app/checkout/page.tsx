/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CartItem, useCart } from "@/contexts/CartContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import { sendOrderConfirmationEmail } from "@/lib/sendOrderConfirmationEmail";
import { getProxiedImagePath } from "@/lib/utils";
import * as Tooltip from "@radix-ui/react-tooltip";
import ShippingMap from "@/components/ShippingMap";

type Settings = {
  admin_email: string;
  admin_phone: string;
};

export default function CheckoutPage() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    address_details: "",
    email: "",
    phone: "",
    delivery_option: "",
    payment_method: "efectivo",
    confirm_method: "",
  });
  const { cart, addToCart, removeFromCart, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState({
    admin_email: "",
    admin_phone: "",
  });
  const [shippingCost, setShippingCost] = useState<number>(-1);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);

  const router = useRouter();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    async function fetchData() {
      const { data: s } = await supabase
        .from("settings")
        .select("*")
        .eq("id", "main")
        .single<Settings>();

      setSettings(s || settings);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (form.delivery_option !== "entrega") {
      setShippingCost(0);
      setDestCoords(null);
      return;
    }

    if (form.address.trim() === "") {
      setShippingCost(-1);
      setDestCoords(null);
      return;
    }

    const handler = setTimeout(async () => {
      setShippingCost(-1);

      try {
        const res = await fetch("/api/calculateShipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination: form.address,
          }),
        });

        const data = await res.json();

        if (data.shippingCost === undefined || data.shippingCost === null) {
          throw new Error("No se pudo calcular el costo de envío");
        }

        setShippingCost(data.shippingCost);
        if (data.destinationCoords) setDestCoords(data.destinationCoords);
      } catch (err) {
        console.error("Error calculando envío", err);
        setShippingCost(-1);
        setDestCoords(null);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [form.delivery_option, form.address]);

  async function recalculateShippingFromCoords(coords: [number, number]) {
    try {
      const res = await fetch("/api/calculateShipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coords }),
      });
      const data = await res.json();
      if (data.shippingCost !== undefined && data.shippingCost !== null) {
        setShippingCost(data.shippingCost);
      }
    } catch (err) {
      console.error("Error recalculando envío", err);
      setShippingCost(-1);
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function validateStock(cart: CartItem[]) {
    const currentProducts: { id: string; stock: number }[] = [];

    for (const item of cart) {
      const { data: product, error } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.id)
        .single();

      if (error || !product) {
        throw new Error(`Error al verificar stock para ${item.name}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${item.name}. Solo quedan ${product.stock}`,
        );
      }

      currentProducts.push({ id: item.id, stock: product.stock });
    }

    return currentProducts;
  }

  async function discountStock(
    currentProducts: { id: string; stock: number }[],
    cart: CartItem[],
  ) {
    for (const item of cart) {
      const product = currentProducts.find((p) => p.id === item.id);
      if (!product) {
        continue;
      }

      const newStock = product.stock - item.quantity;

      const { error } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", item.id);

      if (error) {
        console.error(`❌ Error actualizando stock de ${item.name}`, error);
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const currentProducts = await validateStock(cart);

      const { data: order, error } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: form.name,
            address: form.address,
            address_details: form.address_details,
            phone: form.phone,
            email: form.email,
            delivery_option: form.delivery_option,
            payment_method: form.payment_method,
            confirm_method: form.confirm_method,
            total: total,
            shipping_cost: shippingCost,
            destination_lat: destCoords ? destCoords[1] : null,
            destination_lng: destCoords ? destCoords[0] : null,
          },
        ])
        .select()
        .single();

      if (error || !order) throw new Error("❌ Error al crear pedido");

      await discountStock(currentProducts, cart);

      const items = cart.map((p) => ({
        order_id: order.id,
        product_id: p.id,
        quantity: p.quantity,
        price: p.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(items);

      if (itemsError)
        throw new Error("❌ Error al guardar productos del pedido");

      setMessage("✅ Pedido realizado con éxito");
      clearCart();

      if (form.confirm_method === "email") {
        await sendOrderConfirmationEmail({
          name: order.customer_name,
          email: order.email,
          orderUrl: `${window.location.origin}/order/${order.id}`,
        });
      }

      router.push(`/thanks?orderId=${order.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="text-6xl">
          <ShoppingCart className="w-12 h-12 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold">Tu carrito está vacío</h2>
        <p className="text-muted-foreground">
          ¡Agregá productos para comenzar tu pedido!
        </p>
        <Link
          href="/"
          className="bg-background text-foreground border border-black dark:border-white/20 px-4 py-2 rounded hover:bg-foreground hover:text-background transition z-1"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <Tooltip.Provider>
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-1">
        {/* 🧾 Caja 1 - Resumen de productos */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-6 md:col-span-2 md:row-start-1">
          <h1 className="text-2xl font-bold">Resumen del pedido 🧾</h1>
          <ul className="space-y-4">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 border-b border-gray-200 pb-4"
              >
                <div className="w-14 h-14 relative rounded overflow-hidden bg-muted shrink-0">
                  {item.image_url && (
                    <Image
                      src={getProxiedImagePath(item.image_url)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL="/placeholder.png"
                      onError={(e) =>
                        (e.currentTarget.src = "/placeholder.png")
                      }
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toLocaleString()} x {item.unit_label}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => {
                        if (item.quantity > 1) {
                          addToCart({ ...item, quantity: -1 } as any);
                        } else {
                          removeFromCart(item.id);
                        }
                      }}
                      className="px-2 py-1 rounded border text-sm"
                    >
                      ➖
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => addToCart({ ...item, quantity: 1 } as any)}
                      className="px-2 py-1 rounded border text-sm"
                    >
                      ➕
                    </button>
                    <ConfirmDialog
                      title="¿Eliminar producto? 🗑"
                      description={`¿Querés eliminar ${item.name} del carrito?`}
                      onConfirm={() => {
                        removeFromCart(item.id);
                        toast.success(`${item.name} eliminado del carrito`);
                      }}
                    >
                      <button className="ml-4 text-destructive text-sm hover:underline">
                        🗑
                      </button>
                    </ConfirmDialog>
                  </div>
                </div>
                <p className="font-semibold whitespace-nowrap">
                  ${Number(item.price * item.quantity).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* 📝 Caja 2 - Formulario */}
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md space-y-4 md:col-span-2 md:row-start-2"
        >
          <h2 className="text-lg font-bold">Tus datos 📇</h2>

          <input
            name="name"
            type="text"
            placeholder="Nombre completo"
            onChange={handleChange}
            className="input"
            required
          />
          <select
            name="delivery_option"
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">¿Cómo recibís?</option>
            <option value="entrega">Entrega a domicilio</option>
            <option value="retiro">Retiro en el local</option>
          </select>

          {form.delivery_option === "entrega" && (
            <>
              <input
                name="address"
                type="text"
                placeholder="Dirección de entrega"
                onChange={handleChange}
                className="input"
                required
              />
              <input
                name="address_details"
                type="text"
                placeholder="Depto, piso o referencias (opcional)"
                onChange={handleChange}
                className="input"
              />
            </>
          )}

          <select
            name="confirm_method"
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">¿Cómo querés recibir la confirmación?</option>
            <option value="email">Por Email</option>
          </select>

          <input
            name="email"
            type="email"
            placeholder="Tu email"
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="phone"
            type="tel"
            placeholder="Tu WhatsApp"
            onChange={handleChange}
            className="input"
            required
          />

          <select
            name="payment_method"
            onChange={handleChange}
            className="input"
          >
            <option value="">¿Cómo querés pagar?</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>

          {message && <p className="text-sm text-green-600">{message}</p>}
        </form>

        {/* 🧮 Caja 3 - Resumen final */}
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4 h-fit md:col-span-1 md:row-span-2 md:row-start-1 md:sticky md:top-8">
          <h2 className="text-lg font-bold">Resumen final 💰</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal productos:</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="flex items-center gap-1">
                Costo de envío:
                {shippingCost > 0 && (
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <span className="text-gray-800">ⓘ</span>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      side="top"
                      className="rounded bg-black px-2 py-1 text-xs text-white"
                    >
                      Si ves irregularidades en el costo, no dudes en
                      contactarnos.
                    </Tooltip.Content>
                  </Tooltip.Root>
                )}
              </span>
              <span>
                {form.delivery_option !== "entrega" ||
                form.address.trim() === ""
                  ? "—"
                  : shippingCost === -1
                    ? "Calculando..."
                    : `$${shippingCost.toLocaleString()}`}
              </span>
            </div>
            {destCoords && (
              <>
                <div className="bg-blue-50 border border-blue-200 text-blue-500 text-sm p-3 rounded mb-2">
                  Si la ubicación no coincide con tu dirección, podés mover el
                  marcador en el mapa para calcular el costo de envío con
                  precisión.
                </div>
                <ShippingMap
                  coords={destCoords}
                  draggable={true}
                  onCoordsChange={(newCoords) => {
                    setDestCoords(newCoords);
                    recalculateShippingFromCoords(newCoords);
                  }}
                />
              </>
            )}

            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>
                {shippingCost >= 0
                  ? `$${(total + shippingCost).toLocaleString()}`
                  : "Calculando..."}
              </span>
            </div>
          </div>
          <button
            form="checkout-form"
            type="submit"
            disabled={loading || cart.length === 0 || shippingCost < 0}
            className={`w-full text-white text-lg font-semibold py-3 rounded-md transition ${
              loading || cart.length === 0 || shippingCost < 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800 cursor-pointer"
            }`}
          >
            {loading
              ? "Enviando..."
              : `Confirmar pedido 🧾 ($${(
                  total + shippingCost
                ).toLocaleString()})`}
          </button>
        </div>
      </div>
    </Tooltip.Provider>
  );
}
