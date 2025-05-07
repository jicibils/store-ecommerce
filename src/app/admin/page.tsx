// src/app/admin/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/uploadImage";

export default function AdminPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
    stock: "",
    discount: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const imageUrl = await uploadImage(file);
      setForm((prev) => ({ ...prev, image_url: imageUrl }));
      setMessage("✅ Imagen subida con éxito");
    } catch (err) {
      setMessage("❌ Error al subir imagen");
      console.log(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("products").insert([
      {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        discount: parseFloat(form.discount || "0"),
      },
    ]);

    setLoading(false);

    if (error) {
      setMessage(`❌ Error: ${error.message}`);
    } else {
      setMessage("✅ Producto cargado exitosamente");
      setForm({
        name: "",
        description: "",
        price: "",
        image_url: "",
        category: "",
        stock: "",
        discount: "",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Agregar producto</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          onChange={handleChange}
          value={form.name}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Descripción"
          onChange={handleChange}
          value={form.description}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Precio"
          onChange={handleChange}
          value={form.price}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="image_url"
          placeholder="URL de imagen"
          onChange={handleChange}
          value={form.image_url}
          className="w-full border p-2 rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="category"
          placeholder="Categoría"
          onChange={handleChange}
          value={form.category}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          onChange={handleChange}
          value={form.stock}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="number"
          name="discount"
          placeholder="Descuento (%)"
          onChange={handleChange}
          value={form.discount}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Cargando..." : "Cargar producto"}
        </button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
