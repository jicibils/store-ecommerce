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
    unit_id: "",
    is_offer: false,
    image_url: "",
    category_id: "",
    stock: "",
    discount: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [units, setUnits] = useState<{ id: number; label: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  useEffect(() => {
    const fetchUnits = async () => {
      const { data, error } = await supabase.from("units").select("id, label");
      if (!error && data) setUnits(data);
    };
    fetchUnits();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name");
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

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
            unit_id: data.unit_id?.toString() || "",
            is_offer: data.is_offer || false,
            image_url: data.image_url || "",
            category_id: data.category_id || "",
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
      unit_id: parseInt(form.unit_id),
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
          unit_id: "",
          is_offer: false,
          image_url: "",
          category_id: "",
          stock: "",
          discount: "",
          is_active: true,
        });
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 relative z-1">
      <h1 className="text-2xl font-bold">
        {productId ? "Editar producto" : "Agregar producto"}
      </h1>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow space-y-4">
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
              name="unit_id"
              value={form.unit_id}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="" disabled hidden>
                Seleccioná una unidad
              </option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
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
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Seleccioná una categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
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
                onChange={(e) =>
                  setForm({ ...form, is_offer: e.target.checked })
                }
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
              className="bg-black text-white px-4 py-2 rounded border border-black hover:bg-white hover:text-black transition disabled:opacity-50"
            >
              {loading
                ? "Guardando..."
                : productId
                ? "Guardar cambios"
                : "Cargar producto"}
            </button>
          </div>
        </form>

        {message && <p className="text-sm pt-2">{message}</p>}
      </div>
    </div>
  );
}
