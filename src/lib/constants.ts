export const APP_NAME = "Fruvercom";
export const LOGO_EMOJI = "🍅";
export const LOGO = "/fruvercomLogo.png";

export const CONTACT_EMAIL = "fruvercom.tienda@gmail.com";
export const CONTACT_PHONE = "5493586548002"; // sin + ni espacios para WhatsApp
export const CONTACT_ADDRESS = "Calle Lamadrid 1311, Río Cuarto";
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
  CANCELLED = "cancelled",
  DELIVERED = "delivered",
  REFUNDED = "refunded",
  READY_FOR_PICKUP = "ready_for_pickup",
  ON_THE_WAY = "on_the_way",
}

export const FINAL_STATUSES = [
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.REFUNDED,
];

export const ORDER_STATUS_LABELS: Record<ORDER_STATUS, string> = {
  [ORDER_STATUS.PENDING]: "Pendiente",
  [ORDER_STATUS.CONFIRMED]: "Confirmado",
  [ORDER_STATUS.READY_FOR_PICKUP]: "A Retirar",
  [ORDER_STATUS.ON_THE_WAY]: "En Camino",
  [ORDER_STATUS.DELIVERED]: "Entregado",
  [ORDER_STATUS.CANCELLED]: "Cancelado",
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
  {
    value: ORDER_STATUS.READY_FOR_PICKUP,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.READY_FOR_PICKUP],
  },
  {
    value: ORDER_STATUS.ON_THE_WAY,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.ON_THE_WAY],
  },
  {
    value: ORDER_STATUS.DELIVERED,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.DELIVERED],
  },
  {
    value: ORDER_STATUS.CANCELLED,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.CANCELLED],
  },
  {
    value: ORDER_STATUS.REFUNDED,
    label: ORDER_STATUS_LABELS[ORDER_STATUS.REFUNDED],
  },
];

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-200 text-yellow-800",
  confirmed: "bg-blue-200 text-blue-800",
  cancelled: "bg-red-200 text-red-800",
  delivered: "bg-emerald-200 text-emerald-800",
  refunded: "bg-purple-200 text-purple-800",
  ready_for_pickup: "bg-orange-200 text-orange-800",
  on_the_way: "bg-cyan-200 text-cyan-800",
};

export enum CATEGORY_TYPE {
  MARKET = "market",
  VERDULERIA = "verduleria",
}
