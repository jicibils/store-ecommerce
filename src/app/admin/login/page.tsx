// src/app/admin/login/page.tsx
"use client";

import Logo from "@/components/Logo";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error("❌ Login incorrecto");
    } else {
      toast.success("👋 Bienvenido");
      router.push("/admin");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg border border-muted">
      <div className="max-w-sm mx-auto p-4 text-center">
        <div className="flex justify-center mb-2">
          <Logo size={180} />
        </div>
        <h1 className="text-2xl font-bold mt-4 mb-8">Ingresar al panel</h1>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full border p-2 rounded bg-black text-white dark:border-white dark:hover:bg-white dark:hover:text-black cursor-pointer"
        >
          {loading ? "Cargando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
