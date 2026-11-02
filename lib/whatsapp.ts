/**
 * WhatsApp Business Integration Helper & Message Templates
 * Phone / WhatsApp: +420 776 355 386
 */

export const KING_SERVICE_WHATSAPP_PHONE = "+420776355386";
export const WHATSAPP_PHONE_CLEAN = "420776355386";

export interface WhatsAppCartItem {
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasure?: string;
}

export interface WhatsAppOrderDetails {
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    unitOfMeasure?: string;
  }>;
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  deliveryDate?: string | Date;
  deliveryAddress?: string;
}

/**
 * Format pre-filled cart sharing message string
 * Spec example:
 * KING SERVICE – New Order
 * Customer: THE BOSS KEBAB DĚČÍN
 * DÜRÜM KING – 20 units
 * YOGURT – 10 units
 * Order Total: Automatically calculated
 */
export function formatWhatsAppCartMessage(params: {
  customerName?: string;
  items: WhatsAppCartItem[];
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  notes?: string;
}): string {
  const { customerName, items, subtotal, taxTotal, totalAmount, notes } = params;

  let msg = `*KING SERVICE – New Order*\n\n`;
  if (customerName) {
    msg += `*Customer:* ${customerName}\n\n`;
  } else {
    msg += `*Customer:* Wholesale Quick Order\n\n`;
  }

  msg += `*Order Items:*\n`;
  items.forEach((item) => {
    const uom = item.unitOfMeasure || "units";
    const itemTotal = (item.quantity * item.unitPrice).toFixed(2);
    msg += `• ${item.name} – ${item.quantity} ${uom} (${item.unitPrice.toFixed(2)} CZK/${uom} = ${itemTotal} CZK)\n`;
  });

  msg += `\n*Subtotal (excl. VAT):* ${subtotal.toFixed(2)} CZK`;
  msg += `\n*VAT (21%):* ${taxTotal.toFixed(2)} CZK`;
  msg += `\n*Order Total:* ${totalAmount.toFixed(2)} CZK\n`;

  if (notes && notes.trim()) {
    msg += `\n*Notes:* ${notes.trim()}\n`;
  }

  msg += `\nPlease confirm availability and delivery slot. Thank you!`;
  return msg;
}

/**
 * Format order confirmation template message sent to customer
 */
export function formatWhatsAppOrderConfirmation(order: WhatsAppOrderDetails): string {
  let msg = `*KING SERVICE – Order Confirmation*\n`;
  msg += `*Order #:* ${order.orderNumber}\n`;
  msg += `*Customer:* ${order.customerName}\n\n`;

  msg += `*Items Ordered:*\n`;
  order.items.forEach((item) => {
    const uom = item.unitOfMeasure || "pcs";
    msg += `• ${item.name}: ${item.quantity} ${uom} @ ${item.unitPrice.toFixed(2)} CZK\n`;
  });

  msg += `\n*Total Amount:* ${order.totalAmount.toFixed(2)} CZK (incl. VAT)\n`;
  if (order.deliveryDate) {
    const formattedDate = typeof order.deliveryDate === 'string'
      ? order.deliveryDate
      : new Date(order.deliveryDate).toLocaleDateString('cs-CZ');
    msg += `*Scheduled Delivery:* ${formattedDate}\n`;
  }
  msg += `\nYour order has been received and confirmed. We are preparing it for dispatch!`;
  return msg;
}

/**
 * Format delivery notification template message
 */
export function formatWhatsAppDeliveryNotification(params: {
  orderNumber: string;
  customerName: string;
  driverName?: string;
  driverPhone?: string;
  estimatedTime?: string;
  deliveryAddress?: string;
}): string {
  let msg = `*KING SERVICE – Delivery Notification 🚚*\n\n`;
  msg += `Dear ${params.customerName},\n`;
  msg += `Your order *${params.orderNumber}* is out for delivery!\n\n`;

  if (params.estimatedTime) {
    msg += `*Estimated Arrival:* ${params.estimatedTime}\n`;
  }
  if (params.deliveryAddress) {
    msg += `*Delivery Address:* ${params.deliveryAddress}\n`;
  }
  if (params.driverName) {
    msg += `*Driver:* ${params.driverName}`;
    if (params.driverPhone) msg += ` (${params.driverPhone})`;
    msg += `\n`;
  }

  msg += `\nPlease ensure someone is available at the venue to receive the shipment. Thank you!`;
  return msg;
}

/**
 * Generate click-to-chat WhatsApp URL for browser / desktop app
 */
export function generateWhatsAppLink(phone: string, text: string): string {
  // Strip non-digit characters except leading plus
  let cleanPhone = phone.replace(/[^\d+]/g, '');
  if (cleanPhone.startsWith('+')) {
    cleanPhone = cleanPhone.substring(1);
  }
  // Default to KING SERVICE official number if none provided
  if (!cleanPhone) {
    cleanPhone = WHATSAPP_PHONE_CLEAN;
  }

  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
