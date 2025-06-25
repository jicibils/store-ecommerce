// src/app/admin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    admin_email: "",
    admin_phone: "",
  });
  const [units, setUnits] = useState<string[]>([]);
  const [newUnit, setNewUnit] = useState("");
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

    const fetchUnits = async () => {
      const { data } = await supabase.from("units").select("label");
      if (data) setUnits(data.map((u) => u.label));
    };

    fetchSettings();
    fetchUnits();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("settings").upsert({
      id: "main",
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

  const handleAddUnit = async () => {
    if (!newUnit.trim()) return;
    const { error } = await supabase.from("units").insert({ label: newUnit });
    if (!error) {
      setUnits((prev) => [...prev, newUnit]);
      setNewUnit("");
    }
  };

  const handleDeleteUnit = async (label: string) => {
    const { error } = await supabase.from("units").delete().eq("label", label);
    if (!error) {
      setUnits((prev) => prev.filter((u) => u !== label));
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8 relative z-1">
      <h1 className="text-2xl font-bold">Configuración general</h1>

      {/* 📬 Caja de contacto del admin */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow space-y-4">
        <input
          name="admin_email"
          type="email"
          placeholder="Email del admin"
          value={form.admin_email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="admin_phone"
          type="tel"
          placeholder="WhatsApp del admin"
          value={form.admin_phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </Button>

        {message && <p className="text-sm pt-2">{message}</p>}
      </div>

      {/* 📏 Caja de unidades */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-bold">Unidades disponibles</h2>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nueva unidad (ej: docena)"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <Button onClick={handleAddUnit}>Agregar</Button>
        </div>

        <ul className="space-y-2">
          {units.map((unit) => (
            <li
              key={unit}
              className="flex justify-between items-center border p-2 rounded"
            >
              <span>{unit}</span>
              <button
                onClick={() => handleDeleteUnit(unit)}
                className="text-red-600 text-sm hover:underline"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
