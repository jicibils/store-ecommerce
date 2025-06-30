"use client";

import Logo from "@/components/Logo";
import { LucideStore, LucideLeaf, LucideTag } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GlobalSearchBar from "@/components/GlobalSearch";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      label: "Market",
      icon: <LucideStore className="w-10 h-10 text-orange-600 animate-pulse" />,
      route: "/market",
    },
    {
      label: "Verdulería",
      icon: <LucideLeaf className="w-10 h-10 text-green-600 animate-pulse" />,
      route: "/fruver",
    },
    {
      label: "Ofertas",
      icon: <LucideTag className="w-10 h-10 text-yellow-500 animate-pulse" />,
      route: "/sales",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="bg-orange-600 min-h-screen flex flex-col relative overflow-hidden">
        {/* Curva superior decorativa */}
        <div className="relative w-full h-[250px]">
          <svg
            className="absolute z-2 top-0 left-0 w-full h-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              fillOpacity="0.5"
              d="M0,160L80,138.7C160,117,320,75,480,90.7C640,107,800,181,960,202.7C1120,224,1280,192,1360,176L1440,160V0H0Z"
            />
          </svg>
        </div>

        {/* Logo central flotante */}
        <div className="absolute top-[120px] left-1/2 transform -translate-x-1/2 z-20 bg-white rounded-full p-6 shadow-2xl border-4 border-orange-700">
          <Logo size={180} />
        </div>

        {/* Frase destacada */}
        <div
          className="mt-[200px] text-center text-white font-semibold text-2xl"
          style={{ fontFamily: "Dancing Script, cursive" }}
        >
          Tu tienda de confianza, ahora digital !
        </div>
        <GlobalSearchBar />

        {/* Accesos principales */}
        <div className="mt-8 pb-6 flex justify-center gap-6 flex-wrap px-4">
          {features.map((f) => (
            <div
              key={f.label}
              onClick={() => router.push(f.route)}
              className="relativve z-1 w-36 h-36 bg-white rounded-3xl shadow-lg flex flex-col items-center justify-center cursor-pointer
              transition-all duration-300 hover:scale-105 hover:shadow-2xl border-3 border-orange-700"
            >
              {f.icon}
              <span className="mt-3 font-bold text-base text-neutral-800">
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
