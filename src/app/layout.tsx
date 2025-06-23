/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { CartProvider } from "@/contexts/CartContext";
import FloatingCartBar from "@/components/FloatingCartBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import Banner from "@/components/Banner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fruvercom App",
  description: "E-commerce Verduleria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        className={`bg-gray-50 min-h-screen flex flex-col ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="bg-pattern" />
        <CartProvider>
          <Navbar />
          <Banner />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingCartBar />
          <FloatingWhatsAppButton />
        </CartProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
