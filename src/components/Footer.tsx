"use client";

import {
  APP_NAME,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_ADDRESS,
  SOCIAL_LINKS,
  WORKING_HOURS,
} from "@/lib/constants";
import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background text-foreground mt-10">
      <div className="max-w-6xl mx-auto px-6 py-8 grid gap-4 md:grid-cols-3 text-sm">
        <div>
          <h2 className="text-lg font-bold mb-2">
            <Logo />
            {APP_NAME}
          </h2>
          <p className="text-muted-foreground">{CONTACT_ADDRESS}</p>
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold">Contacto</h3>
          <p>
            Email:{" "}
            <Link
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline hover:text-primary"
            >
              {CONTACT_EMAIL}
            </Link>
          </p>
          <p>
            WhatsApp:{" "}
            <Link
              href={`https://wa.me/${CONTACT_PHONE}`}
              className="underline hover:text-primary"
              target="_blank"
            >
              {CONTACT_PHONE}
            </Link>
          </p>
          <p>
            Horarios:{" "}
            <span className="text-muted-foreground">{WORKING_HOURS}</span>
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold">Enlaces</h3>
          <Link href="/" className="hover:underline block">
            Inicio
          </Link>
          <Link href="/checkout" className="hover:underline block">
            Carrito
          </Link>
          <Link href="/contact" className="hover:underline block">
            Contacto
          </Link>
        </div>
      </div>

      {(SOCIAL_LINKS.instagram ||
        SOCIAL_LINKS.facebook ||
        SOCIAL_LINKS.twitter) && (
        <div className="flex justify-center gap-4 mt-2 mb-4">
          {SOCIAL_LINKS.instagram && (
            <Link
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 hover:text-primary transition" />
            </Link>
          )}
          {SOCIAL_LINKS.facebook && (
            <Link
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 hover:text-primary transition" />
            </Link>
          )}
          {SOCIAL_LINKS.twitter && (
            <Link
              href={SOCIAL_LINKS.twitter}
              target="_blank"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5 hover:text-primary transition" />
            </Link>
          )}
        </div>
      )}

      <div className="text-center text-xs py-4 border-t border-border text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
