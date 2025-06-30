"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export default function GlobalSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [input, setInput] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/search?q=${encodeURIComponent(input.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 max-w-2xl mx-auto mt-6 px-4"
    >
      <div className="relative flex-1 z-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-orange-700 bg-white text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-800 focus:border-transparent transition duration-200"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
      <button
        type="submit"
        className="bg-orange-600 hover:bg-orange-700 border-2 border-orange-700 text-white px-4 py-2 rounded-full font-medium transition duration-200 transform hover:scale-[1.03] cursor-pointer z-1"
      >
        Buscar
      </button>
    </form>
  );
}
