import { NextResponse } from "next/server";
import {
  EMPTY_PAYMENT,
  isPaymentMethod,
  isPaymentProof,
  orderSummaryText,
  paymentLabel,
  priceOrder,
  validateCustomer,
  validatePayment,
  type CustomerDetails,
  type OrderRequest,
  type PaymentDetails,
  type PricedOrder,
} from "@/lib/order";
import { serverEnv } from "@/lib/env";
import { formatINR, whatsappLink } from "@/lib/shop";

export const runtime = "nodejs";

type ApiError = { code: string; message: string; details?: unknown };

const fail = (status: number, code: string, message: string, details?: unknown) =>
  NextResponse.json<{ error: ApiError }>({ error: { code, message, details } }, { status });

/** Correlates the log lines for one order attempt without exposing internals (SEC-9). */
const makeRequestId = () => `req_${Math.random().toString(36).slice(2, 10)}`;

/** Human-readable and roughly sortable: NA-250828-4821 */
function makeOrderId(): string {
  const now = new Date();
  const stamp = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `NA-${stamp}-${random}`;
}

const clean = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const digits = (value: unknown, max: number): string => clean(value, max).replace(/\D/g, "");

function readCustomer(raw: unknown): CustomerDetails {
  const c = (raw ?? {}) as Record<string, unknown>;
  return {
    name: clean(c.name, 80),
    guardian: clean(c.guardian, 80),
    houseNo: clean(c.houseNo, 60),
    village: clean(c.village, 120),
    street: clean(c.street, 120),
    landmark: clean(c.landmark, 120),
    postOffice: clean(c.postOffice, 80),
    tehsil: clean(c.tehsil, 80),
    district: clean(c.district, 80),
    state: clean(c.state, 80),
    pincode: digits(c.pincode, 10),
    phone: digits(c.phone, 20),
    altPhone: digits(c.altPhone, 20),
    notes: clean(c.notes, 400),
  };
}

/** Appends a row to her Google Sheet. Never throws — a notification failure must
 *  not lose an order the customer has already been told was placed. */
async function saveToSheet(
  requestId: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  if (!serverEnv.sheetWebhookUrl) {
    console.warn(`[order] ${requestId} ORDER_SHEET_WEBHOOK_URL not set — sheet skipped`);
    return false;
  }
  try {
    const res = await fetch(serverEnv.sheetWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: serverEnv.sheetSecret ?? "", ...payload }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`sheet responded ${res.status}`);

    // Apps Script answers 200 even when it refused or threw, so the status alone
    // means nothing — the body is the only place the truth is. Without this check
    // a rejected write was logged as a success and the order silently vanished.
    const body = await res.text();
    let ok = false;
    try {
      ok = (JSON.parse(body) as { ok?: unknown }).ok === true;
    } catch {
      throw new Error(`sheet returned non-JSON: ${body.slice(0, 120)}`);
    }
    if (!ok) throw new Error(`sheet refused the write: ${body.slice(0, 200)}`);

    return true;
  } catch (err) {
    console.error(`[order] ${requestId} sheet write failed:`, err);
    return false;
  }
}

async function emailOwner(
  requestId: string,
  orderId: string,
  summary: string
): Promise<boolean> {
  if (!serverEnv.resendApiKey) {
    console.warn(`[order] ${requestId} RESEND_API_KEY not set — email skipped`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serverEnv.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: serverEnv.emailFrom,
        to: [serverEnv.ownerEmail],
        subject: `New order ${orderId}`,
        text: summary,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`resend responded ${res.status}`);
    return true;
  } catch (err) {
    console.error(`[order] ${requestId} email failed:`, err);
    return false;
  }
}

function readPayment(raw: unknown): PaymentDetails {
  const p = (raw ?? {}) as Record<string, unknown>;
  if (!isPaymentMethod(p.method)) return EMPTY_PAYMENT;
  return {
    method: p.method,
    proof: isPaymentProof(p.proof) ? p.proof : "ref",
    reference: clean(p.reference, 32),
  };
}

function sheetRow(
  orderId: string,
  customer: CustomerDetails,
  order: PricedOrder,
  payment: PaymentDetails,
  callUrl: string
): Record<string, unknown> {
  return {
    orderId,
    placedAt: new Date().toISOString(),
    name: customer.name,
    guardian: customer.guardian,
    houseNo: customer.houseNo,
    village: customer.village,
    street: customer.street,
    landmark: customer.landmark,
    postOffice: customer.postOffice,
    tehsil: customer.tehsil,
    district: customer.district,
    state: customer.state,
    pincode: customer.pincode,
    phone: customer.phone,
    altPhone: customer.altPhone,
    notes: customer.notes,
    items: order.items.map((i) => `${i.name} x${i.qty}`).join(" | "),
    subtotal: order.subtotal,
    delivery: order.delivery,
    total: order.total,
    payment: paymentLabel(payment),
    // Make the Sheet say which kind of proof to expect, not just leave a blank.
    paymentRef:
      payment.method !== "upi"
        ? ""
        : payment.proof === "screenshot"
          ? "screenshot on WhatsApp"
          : payment.reference,
    // A UPI order is never "New" — someone has to open the UPI app and check that
    // the money actually arrived before it is packed.
    status: payment.method === "upi" ? "Payment to verify" : "New",
    callUrl,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  const requestId = makeRequestId();

  let body: OrderRequest;
  try {
    body = (await request.json()) as OrderRequest;
  } catch {
    return fail(400, "INVALID_JSON", "We could not read your order. Please try again.");
  }

  const customer = readCustomer(body?.customer);
  const errors = validateCustomer(customer);
  if (Object.keys(errors).length) {
    return fail(
      400,
      "INVALID_DETAILS",
      "Please check the details you entered",
      errors
    );
  }

  const payment = readPayment(body?.payment);
  const paymentError = validatePayment(payment);
  if (paymentError) {
    return fail(400, "INVALID_PAYMENT", "Please check the payment reference", {
      paymentRef: paymentError,
    });
  }

  const items = Array.isArray(body?.items) ? body.items.slice(0, 30) : [];
  const order = priceOrder(items);
  if (!order) {
    return fail(400, "EMPTY_BAG", "Your bag is empty");
  }

  const orderId = makeOrderId();
  const summary = orderSummaryText(orderId, customer, order, payment);

  // One tap from the Sheet dials the customer.
  const callUrl = `tel:+91${customer.phone}`;

  // Both notifications are attempted and neither can fail the request. The customer
  // still gets an order number and the WhatsApp button as a guaranteed fallback.
  const [savedToSheet, emailed] = await Promise.all([
    saveToSheet(requestId, sheetRow(orderId, customer, order, payment, callUrl)),
    emailOwner(requestId, orderId, summary),
  ]);

  // Deliberate exception to SEC-8: with every channel down, the server log is the
  // only remaining copy of an order the customer believes is placed. Losing the
  // sale is worse than the address sitting in a private Vercel log.
  if (!savedToSheet && !emailed) {
    console.error(`[order] ${requestId} ${orderId} reached no channel. Full order:\n${summary}`);
  } else {
    console.info(`[order] ${requestId} ${orderId} placed (sheet=${savedToSheet} email=${emailed})`);
  }

  return NextResponse.json({
    data: {
      orderId,
      total: order.total,
      totalDisplay: formatINR(order.total),
      whatsappUrl: whatsappLink(summary),
    },
  });
}
