import type { MessageKey } from "@/lib/dictionary";
import { products } from "@/lib/products";
import { deliveryChargeFor, formatINR, SHOP } from "@/lib/shop";

/**
 * These fields mirror, one for one and in the same order, the address format she
 * already sends customers on WhatsApp. Matching it means the order that arrives
 * from the website reads exactly like the ones she takes by phone — same fields,
 * same order, nothing to re-learn and nothing missing at delivery time.
 *
 * A single freeform "address" box was the earlier design and was wrong: couriers
 * in this area need Post Office and District as separate lines.
 */
/** How the customer relates to the person named next: son / wife / daughter of.
 *  Her Excel writes "KARAMJEET KAUR W/O AMANDEEP SINGH" as one field, so the
 *  relation has to be captured rather than guessed. */
export type Relation = "S/O" | "W/O" | "D/O";

export const RELATIONS: Relation[] = ["S/O", "W/O", "D/O"];

export const isRelation = (value: unknown): value is Relation =>
  RELATIONS.includes(value as Relation);

export type CustomerDetails = {
  name: string;
  relation: Relation | "";
  guardian: string;
  houseNo: string;
  village: string;
  /** Kept apart from the village because a town address needs both: the town and
   *  the colony inside it. Her sheet gets a column for each. */
  area: string;
  street: string;
  landmark: string;
  postOffice: string;
  tehsil: string;
  district: string;
  state: string;
  pincode: string;
  phone: string;
  altPhone: string;
  notes: string;
};

export const EMPTY_CUSTOMER: CustomerDetails = {
  name: "",
  relation: "",
  guardian: "",
  houseNo: "",
  village: "",
  area: "",
  street: "",
  landmark: "",
  postOffice: "",
  tehsil: "",
  district: "",
  state: "Punjab",
  pincode: "",
  phone: "",
  altPhone: "",
  notes: "",
};

export type PaymentMethod = "cod" | "upi";

/**
 * How a UPI customer shows they paid.
 *
 * "screenshot" exists because typing a 12-digit reference correctly is a real
 * barrier for someone who is not confident with a phone — and everyone already
 * knows how to screenshot and forward. The screenshot travels over WhatsApp
 * rather than being uploaded: an upload needs a storage service, and this shop
 * runs at zero cost.
 */
export type PaymentProof = "ref" | "screenshot";

export type PaymentDetails = {
  method: PaymentMethod;
  proof: PaymentProof;
  /** UPI reference the customer typed. Unverified — see the note on UPI in shop.ts. */
  reference: string;
};

export const EMPTY_PAYMENT: PaymentDetails = { method: "cod", proof: "ref", reference: "" };

export const isPaymentProof = (value: unknown): value is PaymentProof =>
  value === "ref" || value === "screenshot";

export const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  value === "cod" || value === "upi";

/** Reference formats vary by app, so this checks it looks like one rather than
 *  pinning it to 12 digits. It is a typo guard, not proof of payment. */
export function validatePayment(payment: PaymentDetails): "errPaymentRef" | null {
  // Nothing to check when they are sending a screenshot instead.
  if (payment.method !== "upi" || payment.proof === "screenshot") return null;
  return /^[A-Za-z0-9]{6,24}$/.test(payment.reference.trim()) ? null : "errPaymentRef";
}

export type OrderRequest = {
  customer: CustomerDetails;
  payment?: PaymentDetails;
  items: { slug: string; qty: number }[];
  /** Which language the customer read the site in, so she can write back in it. */
  lang?: string;
};

/** Errors are message KEYS, not sentences. The server has no idea which language
 *  the customer picked, so the browser resolves them at render time. */
export type FieldErrors = Partial<Record<keyof CustomerDetails, MessageKey>>;

const digitsOnly = (s: string) => s.replace(/\D/g, "");

const isMobile = (value: string) => /^[6-9]\d{9}$/.test(digitsOnly(value));

/** Runs on the client for instant feedback and again on the server, which is the
 *  copy that actually decides whether an order is accepted. Optional fields match
 *  the ones her own template marks optional. */
export function validateCustomer(c: CustomerDetails): FieldErrors {
  const errors: FieldErrors = {};

  if (c.name.trim().length < 2) errors.name = "errName";
  if (!isRelation(c.relation)) errors.relation = "errRelation";
  if (c.guardian.trim().length < 2) errors.guardian = "errGuardian";
  if (c.village.trim().length < 2) errors.village = "errVillage";
  if (c.landmark.trim().length < 2) errors.landmark = "errLandmark";
  if (c.postOffice.trim().length < 2) errors.postOffice = "errPostOffice";
  if (c.district.trim().length < 2) errors.district = "errDistrict";
  if (c.state.trim().length < 2) errors.state = "errState";

  if (!/^\d{6}$/.test(digitsOnly(c.pincode))) errors.pincode = "errPincode";

  if (!isMobile(c.phone)) errors.phone = "errPhone";
  if (c.altPhone.trim() && !isMobile(c.altPhone)) errors.altPhone = "errPhone";

  return errors;
}

export type PricedOrder = {
  items: { slug: string; name: string; qty: number; price: number; lineTotal: number }[];
  subtotal: number;
  delivery: number;
  total: number;
};

/** Prices are resolved from the catalogue, never from the request body. */
export function priceOrder(items: { slug: string; qty: number }[]): PricedOrder | null {
  const priced = items.flatMap((item) => {
    const product = products.find((p) => p.slug === item.slug);
    const qty = Math.min(20, Math.max(1, Math.trunc(Number(item.qty))));
    if (!product || !Number.isFinite(qty)) return [];
    return [
      {
        slug: product.slug,
        name: product.name,
        qty,
        price: product.price,
        lineTotal: product.price * qty,
      },
    ];
  });

  if (!priced.length) return null;

  const subtotal = priced.reduce((sum, i) => sum + i.lineTotal, 0);
  const delivery = deliveryChargeFor(subtotal);
  return { items: priced, subtotal, delivery, total: subtotal + delivery };
}

/** "KARAMJEET KAUR W/O AMANDEEP SINGH" — one field, exactly as her Excel keeps it. */
export function customerFullName(c: CustomerDetails): string {
  return [c.name, c.relation, c.guardian].filter(Boolean).join(" ").toUpperCase();
}

/** One address line in her house style:
 *  "Vill- Burj Dunnha, Near- Gurdwara Sahib, PO- Gholia Kurd, Dist- Moga" */
export function completeAddress(c: CustomerDetails): string {
  return [
    c.houseNo ? `H.No- ${c.houseNo}` : "",
    c.street,
    c.village ? `Vill/City- ${c.village}` : "",
    c.area ? `Area- ${c.area}` : "",
    c.landmark ? `Near- ${c.landmark}` : "",
    c.postOffice ? `PO- ${c.postOffice}` : "",
    c.tehsil ? `Teh- ${c.tehsil}` : "",
    c.district ? `Dist- ${c.district}` : "",
  ]
    .filter(Boolean)
    .join(", ");
}

/** The address block in her own format, so a website order and a phone order look
 *  identical by the time she reads them. */
export function addressLines(c: CustomerDetails): string[] {
  return [
    `Name: ${c.name}`,
    `Father's/Husband's Name: ${c.guardian}`,
    c.houseNo ? `House No.: ${c.houseNo}` : "",
    `Village/Area: ${c.village}`,
    c.street ? `Street/Road: ${c.street}` : "",
    `Near By: ${c.landmark}`,
    `PO: ${c.postOffice}`,
    c.tehsil ? `Tehsil: ${c.tehsil}` : "",
    `District: ${c.district}`,
    `State: ${c.state}`,
    `Pincode: ${c.pincode}`,
    `Phone No.: ${c.phone}`,
    c.altPhone ? `Alt Phone: ${c.altPhone}` : "",
    c.notes ? `Note: ${c.notes}` : "",
  ].filter(Boolean);
}

export function orderSummaryText(
  orderId: string,
  customer: CustomerDetails,
  order: PricedOrder,
  payment: PaymentDetails = EMPTY_PAYMENT
): string {
  const items = order.items
    .map((i) => `• ${i.name} x ${i.qty} = ${formatINR(i.lineTotal)}`)
    .join("\n");

  return [
    `Order ${orderId} — ${SHOP.name}`,
    "",
    items,
    "",
    payment.method === "upi"
      ? `Paid by UPI: ${formatINR(order.total)} — ${
          payment.proof === "screenshot"
            ? "SCREENSHOT COMING ON WHATSAPP"
            : `REF ${payment.reference}`
        } (CHECK BEFORE SENDING)`
      : `Receive: ${formatINR(order.total)} (Cash on Delivery)`,
    // Only worth a line when there is actually something extra to collect.
    ...(order.delivery > 0 ? [`Includes delivery ${formatINR(order.delivery)}`] : []),
    "",
    ...addressLines(customer),
  ].join("\n");
}
