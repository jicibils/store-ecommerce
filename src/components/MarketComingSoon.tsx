"use client";
import Image from "next/image";

export default function MarketComingSoon() {
  return (
    <div className="text-center mt-12">
      <div className="flex justify-center mb-6">
        <Image
          src="/coming_soon.png"
          alt="Coming Soon"
          width={250}
          height={250}
          className="mx-auto"
          placeholder="blur"
          blurDataURL="/placeholder.png"
        />
      </div>
      <h2 className="text-2xl font-bold mb-2">Market 📦</h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        Muy pronto vas a poder comprar más que solo frutas y verduras 🍞🧀🧼🍗
      </p>
      <span className="mt-4 block text-sm text-gray-400">
        🚧 En construcción
      </span>
    </div>
  );
}
