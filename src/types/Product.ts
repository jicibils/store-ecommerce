// src/types/Product.ts
export type Product = {
  id: string;
  name: string;
  description?: string;
  unit_id?: string;
  unit?: string | { id?: string; label: string } | null;
  category_id?: string;
  category?: { name: string } | null;
  stock: number;
  discount?: number;
  price: number;
  image_url?: string;
  is_active: boolean;
  is_offer?: boolean;
  created_at: string;
};
