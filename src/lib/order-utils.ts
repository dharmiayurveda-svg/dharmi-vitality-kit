export const ORDER_PROCESS_STATUSES = ["confirmed", "processing", "shipped", "delivered"] as const;
export const ORDER_ADMIN_STATUSES = [...ORDER_PROCESS_STATUSES, "cancelled"] as const;

export type OrderProcessStatus = (typeof ORDER_PROCESS_STATUSES)[number];
export type OrderStatus = OrderProcessStatus | "cancelled";

export const COMPLETED_ORDER_STATUSES = new Set<OrderStatus>(["delivered"]);
export const CANCELLABLE_ORDER_STATUSES = new Set<OrderStatus>(["confirmed", "processing"]);

export function isCompletedOrder(status?: string): boolean {
  return status === "delivered";
}

export function canCancelOrder(status?: string): boolean {
  return status === "confirmed" || status === "processing";
}

export function getInvoiceStatusLabel(status?: string, forceCompleted = false): string {
  if (forceCompleted || status === "delivered") return "completed";
  if (status === "cancelled") return "cancelled";
  if (status === "processing" || status === "shipped" || status === "confirmed") return status;
  return "confirmed";
}

export function formatCurrency(value: number): string {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

export function formatCurrencyPlain(value: number): string {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
}


export function calculateDiscountPercentage(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
