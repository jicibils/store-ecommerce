/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import emailjs from "emailjs-com";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import ConfirmDialog from "@/components/ConfirmDialog";

type Settings = {
  admin_email: string;
  admin_phone: string;
};

export default function CheckoutPage() {
  const [form, setForm] = useState({
    name: "",
    address: "",
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
  const router = useRouter();

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

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendOrderEmail = async (data: any) => {
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        data,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      console.log("✅ Email enviado");
    } catch (err) {
      console.error("❌ Error al enviar email", err);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const openWhatsAppMessage = async (data: any) => {
    const mensaje = encodeURIComponent(
      `📦 Nuevo pedido de ${data.name}\nTotal: $${data.total}\nPago: ${data.payment_method}`
    );
    window.open(`https://wa.me/${data.number}?text=${mensaje}`, "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: order, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: form.name,
          address: form.address,
          phone: form.phone,
          email: form.email,
          delivery_option: form.delivery_option,
          payment_method: form.payment_method,
          confirm_method: form.confirm_method,
          total,
        },
      ])
      .select()
      .single();

    if (error || !order) {
      setMessage(`❌ Error al crear pedido`);
      setLoading(false);
      return;
    }

    const items = cart.map((p) => ({
      order_id: order.id,
      product_id: p.id,
      quantity: p.quantity,
      price: p.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items);

    if (itemsError) {
      setMessage(`❌ Error al guardar productos del pedido`);
    } else {
      setMessage("✅ Pedido realizado con éxito");
      clearCart();

      if (form.confirm_method === "email" || form.confirm_method === "ambos") {
        // EMAIL AL CUSTOMER
        // await sendOrderEmail({
        //   customer_name: form.name,
        //   customer_email: form.email,
        //   admin_email: "tuemailadmin@gmail.com",
        //   address: form.address,
        //   phone: form.phone,
        //   delivery_option: form.delivery_option,
        //   total,
        //   items: cart.map((i) => `${i.name} x${i.quantity}`).join("; "),
        //   payment_method: form.payment_method,
        // });
      }

      if (
        form.confirm_method === "whatsapp" ||
        form.confirm_method === "ambos"
      ) {
        //openWhatsAppMessage(...)
      }

      // WSP AL ADMIN
      // openWhatsAppMessage({
      //   number: settings?.admin_phone,
      //   name: form.name,
      //   total,
      //   payment_method: form.payment_method,
      // });

      router.push("/thanks");
    }

    setLoading(false);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
        <Link href="/" className="text-blue-600 underline">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* 🧾 RESUMEN DEL PEDIDO */}
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-2xl font-bold">Resumen del pedido 🧾</h1>

        <ul className="space-y-4">
          {cart.map((item) => (
            <li key={item.id} className="flex items-center gap-4 border-b pb-4">
              <div className="w-14 h-14 relative rounded overflow-hidden bg-muted shrink-0">
                {item.image_url && (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.unit} – ${item.price.toLocaleString()} c/u
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

        <div className="flex justify-between items-center pt-6 border-t">
          <p className="text-lg font-semibold">Total:</p>
          <p className="text-xl font-bold text-primary">
            ${total.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 📝 FORMULARIO */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Tus datos 📇</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Nombre completo"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <select
            name="delivery_option"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">¿Cómo recibís?</option>
            <option value="entrega">Entrega a domicilio</option>
            <option value="retiro">Retiro en el local</option>
          </select>
          {form.delivery_option === "entrega" && (
            <input
              name="address"
              type="text"
              placeholder="Dirección de entrega"
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          )}
          <select
            name="confirm_method"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">¿Cómo querés recibir la confirmación?</option>
            <option value="email">Por Email</option>
            <option value="whatsapp">Por WhatsApp</option>
            <option value="ambos">Ambos</option>
          </select>
          <input
            name="email"
            type="email"
            placeholder="Tu email"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <input
            name="phone"
            type="tel"
            placeholder="Tu WhatsApp"
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <select
            name="payment_method"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="mercado_pago">Mercado Pago</option>
          </select>

          <button
            type="submit"
            disabled={loading || cart.length === 0}
            className={`w-full bg-black border-1 border-white text-white px-4 py-2 hover:bg-white hover:text-black transition ${
              loading || cart.length === 0
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            {loading
              ? "Enviando..."
              : `Confirmar pedido 🧾 ($${total.toLocaleString()})`}
          </button>
        </form>

        {message && <p className="mt-2 text-sm">{message}</p>}
      </div>
    </div>
  );
}
