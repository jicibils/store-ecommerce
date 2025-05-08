/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import emailjs from "emailjs-com";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";

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
  const { cart, clearCart } = useCart();
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
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Finalizar pedido</h1>

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

        <div className="border-t pt-4">
          <h2 className="font-semibold mb-2">Resumen del pedido:</h2>
          <ul className="space-y-1">
            {cart.map((item) => (
              <li key={item.id}>
                {item.name} x{item.quantity} – ${item.price * item.quantity}
              </li>
            ))}
          </ul>
          <p className="font-bold mt-2">Total: ${total.toLocaleString()}</p>
        </div>

        <button
          type="submit"
          disabled={loading || cart.length === 0}
          className={`bg-black border-1 border-white text-white px-4 py-2 hover:bg-white hover:text-black transition ${
            loading || cart.length === 0
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }`}
        >
          {loading
            ? "Enviando..."
            : `Confirmar pedido ($${total.toLocaleString()})`}
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
