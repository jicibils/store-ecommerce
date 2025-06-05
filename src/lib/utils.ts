import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ORDER_STATUSES } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStatusLabelFromList = (status: string): string => {
  return ORDER_STATUSES.find((s) => s.value === status)?.label || status;
};
