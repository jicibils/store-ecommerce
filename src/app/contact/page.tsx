"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("inquiries").insert([form]);

    if (error) {
      toast.error("Error al enviar la consulta");
    } else {
      toast.success("Consulta enviada con éxito");
      setForm({ name: "", email: "", message: "" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 relative z-1">
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h1 className="text-2xl font-bold">Contacto</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            required
            className="input"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="input"
          />
          <textarea
            name="message"
            placeholder="Tu mensaje"
            value={form.message}
            onChange={handleChange}
            required
            className="input h-32 resize-none"
          />
          <div className="pt-4 text-center">
            <button
              type="submit"
              disabled={loading}
              className={`bg-black text-white px-6 py-2 rounded-md border border-black hover:bg-white hover:text-black transition ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? "Enviando..." : "Enviar consulta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
