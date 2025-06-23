"use client";

import CategoryCarousel from "@/components/CategoryCarousel";
import Logo from "@/components/Logo";
import {
  LucideStore,
  LucideLeaf,
  LucideTag,
  Beef,
  Croissant,
  Sparkles,
  Sandwich,
  Beer,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      label: "Market",
      icon: <LucideStore className="w-10 h-10 text-orange-600" />,
      route: "/market",
    },
    {
      label: "Verdulería",
      icon: <LucideLeaf className="w-10 h-10 text-green-600" />,
      route: "/fruver",
    },
    {
      label: "Ofertas",
      icon: <LucideTag className="w-10 h-10 text-yellow-500" />,
      route: "/sales",
    },
  ];

  const CATEGORIES = [
    { icon: Beef, label: "Carnicería" },
    { icon: Croissant, label: "Panadería" },
    { icon: Sparkles, label: "Limpieza" },
    { icon: Sandwich, label: "Fiambres" },
    { icon: Beer, label: "Bebidas" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="bg-orange-600 min-h-screen flex flex-col">
        {/* Curva superior */}
        <div className="relative w-full">
          <div className="h-[250px] bg-white w-full" />

          <svg
            className="absolute top-50 left-0 w-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,112C672,96,768,96,864,122.7C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160V0H0Z"
            />
          </svg>
          {/* Logo flotando (más bajo y visible) */}
          <div className="absolute top-50 left-1/2 transform -translate-x-1/2 -translate-y-[40%] z-10 bg-white rounded-full p-4 shadow-xl">
            <Logo size={200} />
          </div>
        </div>

        <div className="mt-30 pb-6 flex justify-center gap-6 flex-wrap">
          {features.map((f) => (
            <div
              key={f.label}
              onClick={() => router.push(f.route)}
              className="w-32 h-32 z-10 bg-white rounded-2xl shadow-md flex flex-col items-center justify-center
                 cursor-pointer transform transition duration-300 hover:scale-110 hover:shadow-xl"
            >
              {f.icon}
              <span className="mt-2 font-semibold text-sm text-center">
                {f.label}
              </span>
            </div>
          ))}
        </div>

        {/* Categorías */}
        <div className="bg-orange-600 px-6 pb-20 pt-10 max-w-6xl mx-auto w-full">
          <CategoryCarousel categories={CATEGORIES} />
        </div>
      </div>
    </motion.div>
  );
}
