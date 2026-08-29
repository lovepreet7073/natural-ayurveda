"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/lib/cart-store";
import { useT } from "@/lib/i18n";
import { formatINR, whatsappLink, SHOP } from "@/lib/shop";
import type { Product } from "@/lib/products";

export function AddToCart({ product }: { product: Product }) {
  const router = useRouter();
  const t = useT();
  const [qty, setQty] = useState(1);

  const step = (delta: number) => setQty((q) => Math.min(20, Math.max(1, q + delta)));

  const orderNow = () => {
    addToCart(product.slug, qty);
    router.push("/checkout");
  };

  // The message stays in English: she is the one who reads it, and it carries
  // product names that only exist in English.
  const directMessage = whatsappLink(
    `Hello ${SHOP.name}, I want to order:\n\n${product.name}\nQuantity: ${qty}\nPrice: ${formatINR(
      product.price * qty
    )}\n\nPlease confirm my order.`
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <span className="text-lg font-semibold">{t("quantity")}</span>
        <div className="flex items-center gap-1 rounded-xl border-2 border-cream-deep bg-white p-1">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={t("reduceQty")}
            className="h-12 w-12 rounded-lg text-2xl font-bold text-leaf disabled:opacity-30"
            disabled={qty <= 1}
          >
            −
          </button>
          <span className="w-10 text-center text-2xl font-bold" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={t("increaseQty")}
            className="h-12 w-12 rounded-lg text-2xl font-bold text-leaf disabled:opacity-30"
            disabled={qty >= 20}
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={orderNow}
        className="rounded-2xl bg-leaf px-6 py-4 text-xl font-bold text-cream transition hover:bg-leaf-dark"
      >
        {t("orderNow")}
      </button>

      <button
        type="button"
        onClick={() => addToCart(product.slug, qty)}
        className="rounded-2xl border-2 border-leaf px-6 py-3.5 text-lg font-bold text-leaf transition hover:bg-white"
      >
        {t("addToBag")}
      </button>

      {/* Second path: skip the form entirely and talk to a person. */}
      <a
        href={directMessage}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-2xl bg-whatsapp px-6 py-3.5 text-lg font-bold text-white"
      >
        <span aria-hidden className="text-2xl">💬</span>
        {t("orderOnWhatsapp")}
      </a>
    </div>
  );
}
