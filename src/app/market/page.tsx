// src/app/page.tsx
"use client";

import MarketComingSoon from "@/components/MarketComingSoon";
import { motion } from "framer-motion";

export default function MarketPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <main className="p-6">
        <MarketComingSoon />
      </main>
    </motion.div>
  );
}
