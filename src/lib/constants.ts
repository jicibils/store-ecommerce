export const APP_NAME = "Fruvercom";
export const LOGO_EMOJI = "🍅";
export const LOGO = "/fruvercomLogo.png";

export const CONTACT_EMAIL = "fruvercom.tienda@gmail.com";
export const CONTACT_PHONE = "5493586548002"; // sin + ni espacios para WhatsApp
export const CONTACT_ADDRESS = "Calle La madrid 1311, Río Cuarto";
export const WORKING_HOURS = "9:00 a 12:30 y 17:00 a 21:00";

/** DATOS TRANSFERENCIA */
export const ALIAS = "fruvercom.mp";
export const CBU = "0000003100054656301552";
export const TITULAR = "Andres Alejandro Benitez";
export const CUIT = "20-34574757-6";

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/fru.ver.com23",
  facebook: "", // si está vacío, no se muestra
  twitter: "",
};

export enum ORDER_STATUS {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PAID = "paid",
  CANCELLED = "cancelled",
  DELIVERED = "delivered",
  REFUNDED = "refunded",
}

export const ORDER_STATUS_LABELS: Record<ORDER_STATUS, string> = {
  [ORDER_STATUS.PENDING]: "Pendiente",
  [ORDER_STATUS.CONFIRMED]: "Confirmado",
  [ORDER_STATUS.PAID]: "Pagado",
  [ORDER_STATUS.CANCELLED]: "Cancelado",
  [ORDER_STATUS.DELIVERED]: "Entregado",
  [ORDER_STATUS.REFUNDED]: "Devuelto",
};

export const ORDER_STATUSES = [
  {
    value: ORDER_STATUS.PENDING,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.PENDING],
  },
  {
    value: ORDER_STATUS.CONFIRMED,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.CONFIRMED],
  },
  { value: ORDER_STATUS.PAID, label: ORDER_STATUS_LABELS[ORDER_STATUS.PAID] },
  {
    value: ORDER_STATUS.CANCELLED,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.CANCELLED],
  },
  {
    value: ORDER_STATUS.DELIVERED,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.DELIVERED],
  },
  {
    value: ORDER_STATUS.REFUNDED,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.REFUNDED],
  },
];

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-200 text-yellow-800",
  confirmed: "bg-blue-200 text-blue-800",
  paid: "bg-green-200 text-green-800",
  cancelled: "bg-red-200 text-red-800",
  delivered: "bg-emerald-200 text-emerald-800",
  refunded: "bg-purple-200 text-purple-800",
};
