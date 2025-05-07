// src/types/Product.ts
export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  stock: number;
  discount?: number;
  is_active: boolean;
  created_at: string;
};
