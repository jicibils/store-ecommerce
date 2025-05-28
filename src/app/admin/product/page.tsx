// src/app/admin/product/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/uploadImage";

export default function ProductPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    unit: "",
    is_offer: false,
    image_url: "",
    category: "",
    stock: "",
    discount: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (!error && data) {
          setForm({
            name: data.name || "",
            description: data.description || "",
            price: data.price?.toString() || "",
            unit: data.unit || "",
            is_offer: data.is_offer || false,
            image_url: data.image_url || "",
            category: data.category || "",
            stock: data.stock?.toString() || "",
            discount: data.discount?.toString() || "",
            is_active: data.is_active ?? true,
          });
        }
      };
      fetchProduct();
    }
  }, [productId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

    const dataToSend = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      discount: parseFloat(form.discount || "0"),
    };

    const { error } = productId
      ? await supabase.from("products").update(dataToSend).eq("id", productId)
      : await supabase.from("products").insert([dataToSend]);

    setLoading(false);

    if (error) {
      setMessage(`❌ Error: ${error.message}`);
    } else {
      setMessage(
        productId
          ? "✅ Producto actualizado"
          : "✅ Producto cargado exitosamente"
      );
      if (!productId) {
        setForm({
          name: "",
          description: "",
          price: "",
          unit: "",
          is_offer: false,
          image_url: "",
          category: "",
          stock: "",
          discount: "",
          is_active: true,
        });
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {productId ? "Editar producto" : "Agregar producto"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          Nombre
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
            required
          />
        </label>
        <label className="block">
          Descripción
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Precio
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
            required
          />
        </label>
        <label className="block">
          Unidad
          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          >
            <option value="kg">kg</option>
            <option value="½kg">½ kg</option>
            <option value="unidad">unidad</option>
          </select>
        </label>
        <label className="block">
          URL de imagen
          <input
            type="text"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Subir imagen
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <label className="block">
          Categoría
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="frutas">Frutas</option>
            <option value="verduras">Verduras</option>
            <option value="market">Market</option>
          </select>
        </label>
        <label className="block">
          Stock
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
            required
          />
        </label>
        <label className="block">
          Descuento (%)
          <input
            type="number"
            name="discount"
            value={form.discount}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          />
        </label>
        <div>
          <label className="block">
            <input
              type="checkbox"
              name="is_offer"
              checked={form.is_offer}
              onChange={(e) => setForm({ ...form, is_offer: e.target.checked })}
              className="mr-2"
            />
            Es oferta
          </label>
        </div>
        <div>
          <label className="block">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              className="mr-2"
            />
            Activo
          </label>
        </div>
        <div className="pt-2 text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded border-1 border-white"
          >
            {loading
              ? "Guardando..."
              : productId
              ? "Guardar cambios"
              : "Cargar producto"}
          </button>
        </div>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
