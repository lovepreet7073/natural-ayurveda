import { WHATSAPP_NUMBER } from "@/lib/env";

// Single place for the shop's identity. Change these and the whole site follows.
export const SHOP = {
  name: "Natural Ayurveda",
  tagline: "Ayurvedic skin & hair care, delivered to your door",
  /** The person a customer actually reaches. Shown wherever help is offered. */
  owner: "Sharanpreet Kaur",
  /** Which Natural Ayurveda branch this shop is. Customers ask. */
  branch: "Kurali, Punjab",
  // Owner's WhatsApp Business number in international format, digits only.
  whatsapp: WHATSAPP_NUMBER,
  phoneDisplay: "+91 62842 26783",
  email: "sharanpreetkaur683@gmail.com",
} as const;

/**
 * Delivery is included in the product price — the customer pays exactly what the
 * main website lists, and nothing is added at checkout.
 *
 * To start charging for delivery, set `charge` above zero; `freeAbove` then
 * becomes the order value at which it is waived (set it to `Infinity` to charge
 * on every order). Every delivery line in the UI switches itself back on.
 */
export const DELIVERY = {
  charge: 0,
  freeAbove: 0,
} as const;

/** False while delivery is free on everything, which hides the delivery rows. */
export const chargesDelivery: boolean = DELIVERY.charge > 0;

export function deliveryChargeFor(subtotal: number) {
  if (!chargesDelivery) return 0;
  return subtotal >= DELIVERY.freeAbove ? 0 : DELIVERY.charge;
}

/**
 * UPI payment, off until real details are filled in.
 *
 * IMPORTANT: this is a plain UPI collect, not a payment gateway. The site cannot
 * see whether money actually arrived — it only records the reference number the
 * customer types in. Someone can type a made-up number, so a UPI order lands in
 * the Sheet as "Payment to verify" and stays there until it is checked against
 * the real UPI app. Never treat it as paid on the website's word alone.
 *
 * `payeeName` must match the name the customer's UPI app will display when they
 * scan or tap, otherwise the payment looks like it is going to a stranger.
 */
export const UPI = {
  enabled: true,
  /**
   * Exactly as the receiving UPI app shows it. This is the branch's collection
   * account and belongs to her senior, not to Sharanpreet — so the customer WILL
   * see this name when they tap pay. It is shown on the page for that reason: an
   * unexpected name at the payment screen reads as a scam and loses the sale.
   */
  payeeName: "Karamjeet Kaur",
  upiId: "karamjeet225@okicici",
  /** Her QR picture. The checkout hides this block by itself if the file is not
   *  there yet, so nothing shows as broken before it is added. */
  qrImage: "/upi-qr.webp",
} as const;

export const upiEnabled: boolean = UPI.enabled && UPI.upiId.length > 0;

/** Deep link that opens GPay / PhonePe / Paytm with the amount already filled. */
export function upiPayLink(amount: number, note: string): string {
  const params = new URLSearchParams({
    pa: UPI.upiId,
    pn: UPI.payeeName,
    am: String(amount),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function whatsappLink(message: string) {
  return `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(message)}`;
}
