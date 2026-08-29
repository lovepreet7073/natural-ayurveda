"use client";

import Image from "next/image";
import Link from "next/link";
import { removeFromCart, setCartQty, useCart } from "@/lib/cart-store";
import { useT } from "@/lib/i18n";
import { chargesDelivery, DELIVERY, formatINR, upiEnabled } from "@/lib/shop";

export default function CartPage() {
  const { lines, subtotal, delivery, total, ready } = useCart();
  const t = useT();

  if (!ready) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-bark-soft">{t("loading")}</div>
    );
  }

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p aria-hidden className="text-6xl">🛍️</p>
        <h1 className="mt-4 font-serif text-2xl font-bold text-leaf">{t("emptyBag")}</h1>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-2xl bg-leaf px-8 py-4 text-lg font-bold text-cream"
        >
          {t("seeProducts")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-leaf">{t("yourBag")}</h1>

      <ul className="mt-6 space-y-3">
        {lines.map((line) => (
          <li
            key={line.slug}
            className="flex gap-3 rounded-2xl border border-cream-deep bg-white p-3"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
              {line.image && (
                <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" />
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Link
                href={`/products/${line.slug}`}
                className="line-clamp-2 font-semibold leading-snug"
              >
                {line.name}
              </Link>
              <p className="text-lg font-bold text-leaf">{formatINR(line.price * line.qty)}</p>

              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-1 rounded-xl border-2 border-cream-deep p-0.5">
                  <button
                    type="button"
                    onClick={() => setCartQty(line.slug, line.qty - 1)}
                    aria-label={`${t("reduceQty")}: ${line.name}`}
                    className="h-10 w-10 rounded-lg text-2xl font-bold text-leaf"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-xl font-bold">{line.qty}</span>
                  <button
                    type="button"
                    onClick={() => setCartQty(line.slug, line.qty + 1)}
                    aria-label={`${t("increaseQty")}: ${line.name}`}
                    className="h-10 w-10 rounded-lg text-2xl font-bold text-leaf"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(line.slug)}
                  className="px-2 py-2 text-base font-semibold text-bark-soft underline"
                >
                  {t("remove")}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-2 rounded-2xl border border-cream-deep bg-white p-5 text-lg">
        <div className="flex justify-between">
          <dt>{t("itemsTotal")}</dt>
          <dd className="font-semibold">{formatINR(subtotal)}</dd>
        </div>
        {chargesDelivery && (
          <>
            <div className="flex justify-between">
              <dt>{t("delivery")}</dt>
              <dd className="font-semibold">
                {delivery === 0 ? (
                  <span className="text-leaf">{t("free")}</span>
                ) : (
                  formatINR(delivery)
                )}
              </dd>
            </div>
            {delivery > 0 && (
              <p className="text-base text-bark-soft">
                {t("addMoreForFree", { amount: formatINR(DELIVERY.freeAbove - subtotal) })}
              </p>
            )}
          </>
        )}
        <div className="flex justify-between border-t border-cream-deep pt-2 text-2xl font-bold text-leaf">
          <dt>{t("toPay")}</dt>
          <dd>{formatINR(total)}</dd>
        </div>
        <p className="text-base font-semibold text-bark-soft">
          {t(upiEnabled ? "payOptions" : "codExplain")}
        </p>
      </dl>

      <Link
        href="/checkout"
        className="mt-5 flex items-center justify-center rounded-2xl bg-leaf px-6 py-4 text-xl font-bold text-cream"
      >
        {t("orderNow")}
      </Link>
    </div>
  );
}
