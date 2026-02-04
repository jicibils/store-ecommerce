"use client";

import Logo from "@/components/Logo";
import { LucideStore, LucideLeaf } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GlobalSearchBar from "@/components/GlobalSearch";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      label: "Verdulería",
      icon: <LucideLeaf className="w-10 h-10 text-green-600 animate-pulse" />,
      route: "/fruver",
    },
    {
      label: "Dietética",
      icon: <LucideStore className="w-10 h-10 text-orange-600 animate-pulse" />,
      route: "/market",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div
        className="min-h-screen flex flex-col relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/fondoFruver.png')" }}
      >
        <div className="absolute inset-0 bg-white/10 z-0" />

        {/* Logo central flotante */}
        <div className="absolute top-[50px] left-1/2 transform -translate-x-1/2 p-6">
          <Logo size={600} />
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
