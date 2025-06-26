// CartContext.tsx

"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Product } from "@/types/Product";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  unit_label: string;
  unit_id?: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      setCart(JSON.parse(stored));
    }
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, hasMounted]);

  const addToCart = (product: Product & { quantity?: number }) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      const quantityToAdd = product.quantity ?? 1;

      const unit =
        typeof product.unit === "string"
          ? { label: product.unit }
          : product.unit ?? { label: "unidad" };

      if (existing) {
        return prev.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + quantityToAdd }
            : p
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          unit_label: unit.label,
          unit_id: unit.id,
          quantity: quantityToAdd,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  if (!hasMounted) return null;

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};
