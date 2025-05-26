// src/lib/uploadImage.ts
import { supabase } from "./supabase";

export async function uploadImage(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from("products")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("products")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
