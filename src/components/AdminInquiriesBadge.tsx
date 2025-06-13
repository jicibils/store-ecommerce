// src/components/AdminInquiriesBadge.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminInquiriesBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("seen", false);

      if (!error && count !== null) {
        setCount(count);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return count > 0 ? (
    <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
      {count}
    </span>
  ) : null;
}
