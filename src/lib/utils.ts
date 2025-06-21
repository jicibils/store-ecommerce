import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ORDER_STATUSES } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStatusLabelFromList = (status: string): string => {
  return ORDER_STATUSES.find((s) => s.value === status)?.label || status;
};

export function normalizePhone(phone: string): string {
  // Elimina todo lo que no sea número
  let cleaned = phone.replace(/\D/g, "");

  // Si empieza con 0, lo sacamos
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  // Si empieza con 15, lo sacamos (clásico de celulares en Argentina)
  if (cleaned.startsWith("15")) {
    cleaned = cleaned.slice(2);
  }

  // Agregamos prefijo internacional (Argentina por default)
  return `549${cleaned}`;
}

export function getProxiedImagePath(url: string): string {
  const parts = url.split("/storage/v1/object/public/");
  return parts[1] ? `/api/image/${parts[1]}` : "/placeholder.png";
}

export function formatDateToAR(date: string | Date) {
  return new Date(date).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
