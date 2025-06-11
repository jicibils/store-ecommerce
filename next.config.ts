import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["fastly.picsum.photos", "nqfxtmajlhhiyvtnrqgi.supabase.co"], // acá sumás cualquier dominio externo que uses
    unoptimized: true,
  },
};

export default nextConfig;
