"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SHOP } from "@/lib/shop";

export function Header() {
  const { count, ready } = useCart();
  const t = useT();

  return (
    <header className="sticky top-0 z-40 border-b border-cream-deep bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span
            aria-hidden
            className="grid h-10 w-10 place-items-center rounded-full bg-leaf text-lg text-cream"
          >
            🌿
          </span>
          <span className="hidden font-serif text-xl font-semibold leading-tight text-leaf min-[420px]:inline sm:text-2xl">
            {SHOP.name}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Link
            href="/cart"
            aria-label={`${t("bag")}: ${ready ? count : 0}`}
            className="relative flex items-center gap-1.5 rounded-full bg-leaf px-3 py-2.5 text-base font-semibold text-cream transition hover:bg-leaf-dark sm:px-4"
          >
            <span aria-hidden className="text-lg">🛍️</span>
            <span className="hidden sm:inline">{t("bag")}</span>
            {ready && count > 0 && (
              <span className="grid h-6 min-w-6 place-items-center rounded-full bg-gold px-1.5 text-sm font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
