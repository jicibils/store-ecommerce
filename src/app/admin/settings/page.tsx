// src/app/admin/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CATEGORY_TYPE } from "@/lib/constants";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    admin_email: "",
    admin_phone: "",
  });
  const [units, setUnits] = useState<{ id: string; label: string }[]>([]);
  const [newUnit, setNewUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<
    { id: string; name: string; type: string }[]
  >([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("verduleria");
  const [editType, setEditType] = useState("verduleria");

  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editUnitLabel, setEditUnitLabel] = useState("");

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
      const { data } = await supabase
        .from("units")
        .select("id, label")
        .order("label");
      if (data) setUnits(data);
    };

    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, type")
        .order("name");
      if (data) setCategories(data);
    };

    fetchCategories();
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
    const cleaned = newUnit.trim().toLowerCase();
    if (!cleaned) return;

    const { data, error } = await supabase
      .from("units")
      .insert({ label: cleaned })
      .select();

    if (!error && data) {
      setUnits((prev) => [...prev, ...data]);
      setNewUnit("");
    }
  };

  const handleDeleteUnit = async (id: string) => {
    const { error } = await supabase.from("units").delete().eq("id", id);
    if (!error) {
      setUnits((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleAddCategory = async () => {
    const cleaned = newCategory.trim().toLowerCase();
    if (!cleaned) return;

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: cleaned, type: newCategoryType })
      .select();

    if (!error && data) {
      setCategories((prev) => [...prev, ...data]);
      setNewCategory("");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 relative z-1">
      <h1 className="text-2xl font-bold">⚙️ Configuración</h1>

      <Tabs defaultValue="config">
        <TabsList className="mb-4">
          <TabsTrigger value="config">🛠 General</TabsTrigger>
          <TabsTrigger value="units">📏 Unidades</TabsTrigger>
          <TabsTrigger value="categories">🏷 Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          {/* 🛠 Configuración general */}
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
        </TabsContent>

        <TabsContent value="units">
          {/* 📏 Unidades */}
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
                  key={unit.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  {editingUnitId === unit.id ? (
                    <div className="flex gap-2 items-center w-full">
                      <input
                        value={editUnitLabel}
                        onChange={(e) =>
                          setEditUnitLabel(e.target.value.toLowerCase())
                        }
                        className="flex-1 border p-1 rounded"
                      />
                      <Button
                        size="sm"
                        onClick={async () => {
                          const cleaned = editUnitLabel.trim().toLowerCase();
                          if (!cleaned) return;
                          const { error } = await supabase
                            .from("units")
                            .update({ label: cleaned })
                            .eq("id", unit.id);
                          if (!error) {
                            setUnits((prev) =>
                              prev.map((u) =>
                                u.id === unit.id ? { ...u, label: cleaned } : u
                              )
                            );
                            setEditingUnitId(null);
                            setEditUnitLabel("");
                          }
                        }}
                      >
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingUnitId(null);
                          setEditUnitLabel("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="capitalize">{unit.label}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingUnitId(unit.id);
                            setEditUnitLabel(unit.label);
                          }}
                          className="text-blue-600 text-sm hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit.id)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          {/* 🏷 Categorías */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow space-y-4">
            <h2 className="text-xl font-bold">Categorías de productos</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nueva categoría (ej: Market)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 border p-2 rounded"
              />
              <select
                value={newCategoryType}
                onChange={(e) => setNewCategoryType(e.target.value)}
                className="border p-2 rounded"
              >
                <option value={CATEGORY_TYPE.VERDULERIA}>Verdulería</option>
                <option value={CATEGORY_TYPE.MARKET}>Market</option>
              </select>
              <Button onClick={handleAddCategory}>Agregar</Button>
            </div>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  {editingId === cat.id ? (
                    <div className="flex gap-2 items-center w-full">
                      <input
                        value={editName}
                        onChange={(e) =>
                          setEditName(e.target.value.toLowerCase())
                        }
                        className="flex-1 border p-1 rounded"
                      />
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                        className="border p-1 rounded"
                      >
                        <option value={CATEGORY_TYPE.VERDULERIA}>
                          Verdulería
                        </option>
                        <option value={CATEGORY_TYPE.MARKET}>Market</option>
                      </select>
                      <Button
                        size="sm"
                        onClick={async () => {
                          const cleaned = editName.trim().toLowerCase();
                          if (!cleaned) return;
                          const { error } = await supabase
                            .from("categories")
                            .update({ name: cleaned, type: editType })
                            .eq("id", cat.id);
                          if (!error) {
                            setCategories((prev) =>
                              prev.map((c) =>
                                c.id === cat.id
                                  ? { ...c, name: cleaned, type: editType }
                                  : c
                              )
                            );
                            setEditingId(null);
                            setEditName("");
                          }
                        }}
                      >
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setEditName("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="capitalize">
                        {cat.name}{" "}
                        <span className="text-muted-foreground text-xs">
                          ({cat.type})
                        </span>
                      </span>{" "}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditName(cat.name);
                            setEditType(cat.type);
                          }}
                          className="text-blue-600 text-sm hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
