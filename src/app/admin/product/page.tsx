// src/app/admin/product/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/uploadImage";
import Image from "next/image";
import { getProxiedImagePath } from "@/lib/utils";
import imageCompression from "browser-image-compression";

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
      // Opciones de compresión
      const options = {
        maxWidthOrHeight: 800,
        initialQuality: 0.75,
        useWebWorker: true,
        fileType: "image/webp",
      };

      // Comprimir y redimensionar
      const compressedBlob = await imageCompression(file, options);

      // Crear un File con nombre correcto
      const webpFile = new File(
        [compressedBlob],
        `${file.name.split(".")[0]}.webp`,
        { type: "image/webp" }
      );

      // Subir imagen optimizada
      const imageUrl = await uploadImage(webpFile);
      setForm((prev) => ({ ...prev, image_url: imageUrl }));
      setMessage("✅ Imagen optimizada y subida con éxito");
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
        <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1  gap-8">
            {/* Caja Imagen */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow space-y-4">
              <h2 className="text-lg font-semibold">Imagen del producto</h2>

              {form.image_url ? (
                <div className="relative w-full aspect-square rounded overflow-hidden border">
                  <Image
                    src={getProxiedImagePath(form.image_url)}
                    alt={form.name}
                    fill
                    className="object-contain"
                    placeholder="blur"
                    blurDataURL="/placeholder.png"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center rounded">
                  <span className="text-zinc-500">Sin imagen</span>
                </div>
              )}

              <label className="block">
                URL de imagen
                <input
                  type="text"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mt-1"
                  placeholder="https://..."
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
            </div>

            {/* Caja Detalles */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow space-y-4">
              <h2 className="text-lg font-semibold">Detalles del producto</h2>

              <label className="block">
                Nombre *
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
                  placeholder="Descripción opcional"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  Precio *
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
                  Stock *
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    className="w-full border p-2 rounded mt-1"
                    required
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  Categoría *
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
                  Unidad *
                  <select
                    name="unit_id"
                    value={form.unit_id}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                  >
                    <option value="">Seleccioná una unidad</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                Descuento (%)
                <input
                  type="number"
                  name="discount"
                  value={form.discount}
                  onChange={handleChange}
                  className="w-full border p-2 rounded mt-1"
                  placeholder="0"
                />
              </label>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_offer"
                    className="cursor-pointer"
                    checked={form.is_offer}
                    onChange={(e) =>
                      setForm({ ...form, is_offer: e.target.checked })
                    }
                  />
                  Es oferta
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    className="cursor-pointer"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                  />
                  Activo
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded border border-black hover:bg-white hover:text-black transition disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? "Guardando..."
                : productId
                ? "Guardar cambios"
                : "Cargar producto"}
            </button>
          </div>

          {message && <p className="text-sm pt-2 text-center">{message}</p>}
        </form>
      </div>
    </div>
  );
}
