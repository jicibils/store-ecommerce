"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    admin_email: "",
    admin_phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("settings").select("*").single();
      if (data) {
        setForm({
          admin_email: data.admin_email,
          admin_phone: data.admin_phone,
        });
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("settings").upsert({
      id: "main", // clave fija para 1 solo registro
      admin_email: form.admin_email,
      admin_phone: form.admin_phone,
    });

    if (error) {
      setMessage("❌ Error al guardar");
    } else {
      setMessage("✅ Configuración guardada");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Configuración de contacto</h1>

      <input
        name="admin_email"
        type="email"
        placeholder="Email del admin"
        value={form.admin_email}
        onChange={handleChange}
        className="w-full border p-2 rounded mb-4"
      />

      <input
        name="admin_phone"
        type="tel"
        placeholder="WhatsApp del admin"
        value={form.admin_phone}
        onChange={handleChange}
        className="w-full border p-2 rounded mb-4"
      />

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Guardando..." : "Guardar"}
      </Button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
