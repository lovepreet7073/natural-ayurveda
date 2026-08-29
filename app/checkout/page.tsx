"use client";

import Link from "next/link";
import { useState } from "react";
import { clearCart, useCart } from "@/lib/cart-store";
import { useT } from "@/lib/i18n";
import { usePincodeLookup } from "@/lib/pincode";
import type { MessageKey } from "@/lib/dictionary";
import { chargesDelivery, formatINR, SHOP, UPI, upiEnabled, upiPayLink } from "@/lib/shop";
import {
  EMPTY_CUSTOMER,
  EMPTY_PAYMENT,
  validateCustomer,
  validatePayment,
  type CustomerDetails,
  type FieldErrors,
  type PaymentDetails,
  type PaymentMethod,
  type PaymentProof,
} from "@/lib/order";

type Placed = { orderId: string; whatsappUrl: string; total: number };

type Field = {
  key: keyof CustomerDetails;
  label: MessageKey;
  type?: string;
  mode?: "numeric" | "text";
  optional?: boolean;
  multiline?: boolean;
  /** Post Office becomes a dropdown once the PIN code is known. */
  select?: boolean;
  autoComplete?: string;
  /** Short fields sit two-per-row on phones so the form is not one long column. */
  half?: boolean;
};

type Section = { heading: MessageKey; fields: Field[] };

// The fields are the address format she already sends customers on WhatsApp.
// One deliberate difference: PIN code is asked BEFORE Post Office, District and
// State, because answering it fills those three in. She still reads them back in
// her own order — the WhatsApp message, the email and the Sheet are unchanged.
const SECTIONS: Section[] = [
  {
    heading: "secName",
    fields: [
      { key: "name", label: "fName", autoComplete: "name" },
      { key: "guardian", label: "fGuardian" },
    ],
  },
  {
    heading: "secAddress",
    fields: [
      { key: "houseNo", label: "fHouseNo", optional: true, half: true },
      { key: "street", label: "fStreet", optional: true, half: true },
      { key: "village", label: "fVillage", autoComplete: "address-line1" },
      { key: "landmark", label: "fLandmark" },
      { key: "pincode", label: "fPincode", mode: "numeric", autoComplete: "postal-code" },
      { key: "postOffice", label: "fPostOffice", select: true },
      { key: "tehsil", label: "fTehsil", optional: true, half: true },
      { key: "district", label: "fDistrict", autoComplete: "address-level2", half: true },
      { key: "state", label: "fState", autoComplete: "address-level1" },
    ],
  },
  {
    heading: "secPhone",
    fields: [
      { key: "phone", label: "fPhone", type: "tel", mode: "numeric", autoComplete: "tel" },
      { key: "altPhone", label: "fAltPhone", type: "tel", mode: "numeric", optional: true },
      { key: "notes", label: "fNotes", optional: true, multiline: true },
    ],
  },
];

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);

export default function CheckoutPage() {
  const { lines, subtotal, delivery, total, ready } = useCart();
  const t = useT();
  const pin = usePincodeLookup();

  const [customer, setCustomer] = useState<CustomerDetails>(EMPTY_CUSTOMER);
  const [payment, setPayment] = useState<PaymentDetails>(EMPTY_PAYMENT);
  const [payError, setPayError] = useState(false);
  /** Set if her QR picture has not been added to public/ yet. */
  const [qrMissing, setQrMissing] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);

  const verified = pin.status.kind === "found" ? pin.status.area : null;

  const update = (key: keyof CustomerDetails, value: string) => {
    setCustomer((c) => ({ ...c, [key]: value }));
    // Clear the complaint as soon as they start fixing it.
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  /** Checks one field on blur, so a mistake surfaces next to the field that
   *  caused it rather than all at once after Place Order. */
  const checkField = (key: keyof CustomerDetails) => {
    const found = validateCustomer(customer);
    setErrors((e) => ({ ...e, [key]: found[key] }));
  };

  /** Typing the sixth digit triggers the lookup — no button to find or press. */
  const onPincodeChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    update("pincode", digits);

    if (digits.length < 6) {
      pin.reset();
      return;
    }

    void pin.lookup(digits).then((area) => {
      if (!area) return;
      // India Post is authoritative for these, so fill them in and drop any stale
      // complaint about them.
      setCustomer((c) => ({
        ...c,
        district: area.district,
        state: area.state,
        postOffice: area.postOffices.includes(c.postOffice) ? c.postOffice : "",
      }));
      setErrors((e) => ({ ...e, pincode: undefined, district: undefined, state: undefined }));
    });
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFailed(false);

    const found = validateCustomer(customer);
    const badPayment = validatePayment(payment) !== null;
    setPayError(badPayment);

    if (Object.keys(found).length || badPayment) {
      setErrors(found);
      const firstBad = ALL_FIELDS.find((f) => found[f.key]);
      const el = document.getElementById(
        firstBad ? `field-${firstBad.key}` : "field-paymentRef"
      );
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.focus({ preventScroll: true });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          payment,
          items: lines.map((line) => ({ slug: line.slug, qty: line.qty })),
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        // The server replies with message keys, so a server-side rejection still
        // appears in the language the customer chose.
        if (body?.error?.details) setErrors(body.error.details as FieldErrors);
        throw new Error(body?.error?.code ?? "REQUEST_FAILED");
      }

      setPlaced(body.data as Placed);
      clearCart();
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <p aria-hidden className="text-7xl">✅</p>
        <h1 className="mt-4 font-serif text-3xl font-bold text-leaf">{t("orderPlaced")}</h1>

        {/* Order number removed on purpose: it means nothing to the customer and
            reads as one more thing to remember. She still gets it, and it travels
            in the WhatsApp message below. The amount stays, because a
            cash-on-delivery customer needs to know what to keep ready. */}
        {payment.method === "cod" && (
          <p className="mt-6 rounded-2xl border border-cream-deep bg-white p-5 text-lg">
            {t("payOnDelivery")}: <b className="text-bark">{formatINR(placed.total)}</b>
          </p>
        )}

        <p className="mt-6 text-lg">{t("willCall")}</p>

        {/* One tap puts the full order in her WhatsApp — the customer keeps a written
            record and she gets an instant ping even if email is slow. */}
        <a
          href={placed.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 flex items-center justify-center gap-2 rounded-2xl bg-whatsapp px-6 py-4 text-xl font-bold text-white"
        >
          <span aria-hidden className="text-2xl">💬</span>
          {payment.method === "upi" && payment.proof === "screenshot"
            ? t("sendScreenshot")
            : t("sendOnWhatsapp")}
        </a>

        {payment.method === "upi" && payment.proof === "screenshot" && (
          <p className="mt-3 text-base font-semibold text-bark-soft">
            {t("attachReminder")}
          </p>
        )}

        <Link
          href="/products"
          className="mt-5 inline-block text-lg font-semibold text-leaf underline"
        >
          {t("orderSomethingElse")}
        </Link>
      </div>
    );
  }

  if (ready && !lines.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold text-leaf">{t("emptyBag")}</h1>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-2xl bg-leaf px-8 py-4 text-lg font-bold text-cream"
        >
          {t("seeProducts")}
        </Link>
      </div>
    );
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-leaf">{t("yourDetails")}</h1>

      <p className="mt-4 rounded-xl bg-white px-4 py-3 text-base font-semibold text-leaf">
        ✅ {t("codExplain")}
        <span className="mt-1 block font-normal text-bark-soft">{t("noOnlinePayment")}</span>
      </p>

      <form onSubmit={submit} noValidate className="mt-6 space-y-7">
        {SECTIONS.map((section) => (
          <fieldset key={section.heading} className="space-y-4">
            <legend className="mb-1 font-serif text-2xl font-bold text-leaf">
              {t(section.heading)}
            </legend>

            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              {section.fields.map((field) => {
                const error = errors[field.key];
                const id = `field-${field.key}`;
                const isPincode = field.key === "pincode";
                const autoFilled =
                  verified !== null && (field.key === "district" || field.key === "state");

                const className = `w-full rounded-xl border-2 px-4 py-3.5 text-lg outline-none focus:border-leaf ${
                  error ? "border-red-500" : "border-cream-deep"
                } ${autoFilled ? "bg-cream-deep/60" : "bg-white"}`;

                const shared = {
                  id,
                  name: field.key,
                  value: customer[field.key],
                  autoComplete: field.autoComplete,
                  inputMode: field.mode,
                  required: !field.optional,
                  "aria-invalid": Boolean(error),
                  "aria-describedby": error ? `${id}-error` : undefined,
                  className,
                  onBlur: () => checkField(field.key),
                  onChange: (
                    e: React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                    >
                  ) =>
                    isPincode ? onPincodeChange(e.target.value) : update(field.key, e.target.value),
                };

                return (
                  <div key={field.key} className={field.half ? "col-span-1" : "col-span-2"}>
                    <label htmlFor={id} className="mb-1.5 block text-lg font-semibold">
                      {t(field.label)}
                      {field.optional ? (
                        <span className="ml-1.5 text-base font-normal text-bark-soft">
                          ({t("optional")})
                        </span>
                      ) : (
                        <span className="ml-1 text-red-600" aria-label={t("required")}>
                          *
                        </span>
                      )}
                    </label>

                    {field.select ? (
                      <select {...shared} disabled={!verified}>
                        <option value="">
                          {verified ? t("choosePostOffice") : t("pinFillFirst")}
                        </option>
                        {verified?.postOffices.map((office) => (
                          <option key={office} value={office}>
                            {office}
                          </option>
                        ))}
                      </select>
                    ) : field.multiline ? (
                      <textarea {...shared} rows={3} />
                    ) : (
                      <input
                        {...shared}
                        type={field.type ?? "text"}
                        maxLength={isPincode ? 6 : undefined}
                      />
                    )}

                    {isPincode && pin.status.kind !== "idle" && (
                      <p
                        className={`mt-1.5 text-base font-semibold ${
                          pin.status.kind === "found"
                            ? "text-leaf"
                            : pin.status.kind === "checking"
                              ? "text-bark-soft"
                              : "text-red-600"
                        }`}
                        role={pin.status.kind === "notFound" ? "alert" : "status"}
                      >
                        {pin.status.kind === "checking" && t("pinChecking")}
                        {pin.status.kind === "found" &&
                          `✓ ${t("pinFound", {
                            district: pin.status.area.district,
                            state: pin.status.area.state,
                          })}`}
                        {pin.status.kind === "notFound" && t("pinNotFound")}
                        {pin.status.kind === "unavailable" && t("pinUnavailable")}
                      </p>
                    )}

                    {autoFilled && !error && (
                      <p className="mt-1.5 text-sm text-bark-soft">{t("autoFilled")}</p>
                    )}

                    {error && (
                      <p
                        id={`${id}-error`}
                        role="alert"
                        className="mt-1.5 text-base font-semibold text-red-600"
                      >
                        {t(error)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}

        {/* Only appears once real UPI details are filled in lib/shop.ts. Until then
            the shop is cash on delivery exactly as before. */}
        {upiEnabled && (
          <fieldset className="space-y-3">
            <legend className="mb-1 font-serif text-2xl font-bold text-leaf">
              {t("secPayment")}
            </legend>

            {(["cod", "upi"] as PaymentMethod[]).map((method) => {
              const active = payment.method === method;
              return (
                <label
                  key={method}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 ${
                    active ? "border-leaf bg-white" : "border-cream-deep"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={active}
                    onChange={() => {
                      setPayment({ method, proof: "screenshot", reference: "" });
                      setPayError(false);
                    }}
                    className="mt-1.5 h-5 w-5 accent-leaf"
                  />
                  <span>
                    <span className="block text-lg font-bold">
                      {method === "cod" ? t("payCod") : t("payUpi")}
                    </span>
                    <span className="block text-base text-bark-soft">
                      {method === "cod" ? t("payCodNote") : t("payUpiNote")}
                    </span>
                  </span>
                </label>
              );
            })}

            {payment.method === "upi" && (
              <div className="space-y-5 rounded-2xl border-2 border-leaf bg-white p-4">
                {/* Said out loud because the account name is not the shop name. A
                    customer who meets an unfamiliar name at the payment screen
                    assumes a scam and abandons the order. */}
                <p className="rounded-xl bg-cream px-3 py-2 text-base text-bark-soft">
                  <span className="font-semibold text-bark">{t("payTo")}: {UPI.payeeName}</span>
                  <span className="mt-0.5 block font-mono">{UPI.upiId}</span>
                  <span className="mt-1 block">
                    {t("payAccountNote", { branch: SHOP.branch })}
                  </span>
                </p>

                <div>
                  <p className="mb-2 text-lg font-bold text-leaf">
                    {t("payStep1", { amount: formatINR(total) })}
                  </p>

                  {/* Opens GPay / PhonePe / Paytm with payee AND amount filled, which
                      is the whole point on a phone: nothing to type or scan. */}
                  <a
                    href={upiPayLink(total, `Order from ${customer.name || "website"}`)}
                    className="block rounded-2xl bg-leaf px-6 py-4 text-center text-xl font-bold text-cream"
                  >
                    {t("payOpenApp", { amount: formatINR(total) })}
                  </a>

                  {/* The QR carries no amount, so say the figure next to it. Hidden
                      automatically if the picture has not been added yet. */}
                  {UPI.qrImage && !qrMissing && (
                    <div className="mt-4 text-center">
                      <p className="text-base text-bark-soft">{t("payScan")}</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={UPI.qrImage}
                        alt={`UPI QR — ${UPI.payeeName}`}
                        width={640}
                        height={889}
                        onError={() => setQrMissing(true)}
                        className="mx-auto mt-2 h-auto w-56 rounded-xl border border-cream-deep"
                      />
                      <p className="mt-1 text-base font-bold text-leaf">
                        {t("payExact", { amount: formatINR(total) })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-cream-deep pt-4">
                  <p className="mb-2 text-lg font-bold text-leaf">{t("payStep2")}</p>

                  {(["screenshot", "ref"] as PaymentProof[]).map((proof) => (
                    <label
                      key={proof}
                      className="mb-2 flex cursor-pointer items-start gap-3 text-base"
                    >
                      <input
                        type="radio"
                        name="paymentProof"
                        checked={payment.proof === proof}
                        onChange={() => {
                          setPayment((prev) => ({ ...prev, proof, reference: "" }));
                          setPayError(false);
                        }}
                        className="mt-1 h-5 w-5 accent-leaf"
                      />
                      <span className="font-semibold">
                        {proof === "screenshot" ? t("proofScreenshot") : t("proofRef")}
                      </span>
                    </label>
                  ))}

                  {payment.proof === "screenshot" ? (
                    <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-base text-bark-soft">
                      {t("proofScreenshotNote")}
                    </p>
                  ) : (
                    <div className="mt-2">
                      <label
                        htmlFor="field-paymentRef"
                        className="mb-1.5 block text-lg font-semibold"
                      >
                        {t("fPaymentRef")}
                        <span className="ml-1 text-red-600" aria-label={t("required")}>
                          *
                        </span>
                      </label>
                      <input
                        id="field-paymentRef"
                        name="paymentRef"
                        value={payment.reference}
                        inputMode="numeric"
                        aria-invalid={payError}
                        aria-describedby={payError ? "field-paymentRef-error" : "paymentRef-help"}
                        onChange={(e) => {
                          setPayment((prev) => ({ ...prev, reference: e.target.value }));
                          setPayError(false);
                        }}
                        onBlur={() => setPayError(validatePayment(payment) !== null)}
                        className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-lg outline-none focus:border-leaf ${
                          payError ? "border-red-500" : "border-cream-deep"
                        }`}
                      />
                      <p id="paymentRef-help" className="mt-1.5 text-base text-bark-soft">
                        {t("payRefHelp")}
                      </p>
                      {payError && (
                        <p
                          id="field-paymentRef-error"
                          role="alert"
                          className="mt-1.5 text-base font-semibold text-red-600"
                        >
                          {t("errPaymentRef")}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-base font-semibold text-bark-soft">{t("payVerifyNote")}</p>
              </div>
            )}
          </fieldset>
        )}

        <dl className="space-y-2 rounded-2xl border border-cream-deep bg-white p-5 text-lg">
          <div className="flex justify-between">
            <dt>{t("itemsTotal")}</dt>
            <dd className="font-semibold">{formatINR(subtotal)}</dd>
          </div>
          {chargesDelivery && (
            <div className="flex justify-between">
              <dt>{t("delivery")}</dt>
              <dd className="font-semibold">{delivery === 0 ? t("free") : formatINR(delivery)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-cream-deep pt-2 text-2xl font-bold text-leaf">
            <dt>{t("toPay")}</dt>
            <dd>{formatINR(total)}</dd>
          </div>
        </dl>

        {errorCount > 0 && (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-base font-semibold text-red-700">
            {t("fixErrors", { count: errorCount })}
          </p>
        )}

        {failed && (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-base font-semibold text-red-700">
            {t("errGeneric")}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-leaf px-6 py-4 text-xl font-bold text-cream disabled:opacity-60"
        >
          {submitting ? t("pleaseWait") : t("placeOrder")}
        </button>
      </form>
    </div>
  );
}
