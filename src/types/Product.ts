// src/types/Product.ts
export type Product = {
  id: string;
  name: string;
  description?: string;
  unit?: string;
  price: number;
  image_url?: string;
  category?: string;
  stock: number;
  discount?: number;
  is_active: boolean;
  created_at: string;
  is_offer?: boolean;
};
