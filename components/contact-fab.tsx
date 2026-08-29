"use client";

import { useT } from "@/lib/i18n";
import { PhoneIcon, WhatsappIcon } from "@/components/icons";
import { SHOP, whatsappLink } from "@/lib/shop";

/** Floating call and WhatsApp buttons, bottom right on every page — the same
 *  pattern as the main Natural Ayurveda site, so a customer who has seen that one
 *  already knows what these are.
 *
 *  Icon-only, so each carries an aria-label; the visible text sits in a pill that
 *  appears on hover where there is room for it. */
export function ContactFab() {
  const t = useT();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 print:hidden">
      <a
        href={`tel:+${SHOP.whatsapp}`}
        aria-label={`${t("callUs")}: ${SHOP.phoneDisplay}`}
        className="group flex items-center gap-2"
      >
        <span className="hidden rounded-full bg-leaf px-3 py-1.5 text-sm font-semibold text-cream opacity-0 shadow-md transition group-hover:opacity-100 sm:block">
          {t("callUs")}
        </span>
        <span className="grid h-14 w-14 place-items-center rounded-full bg-leaf text-cream shadow-lg ring-4 ring-cream transition hover:scale-105 hover:bg-leaf-dark">
          <PhoneIcon className="h-6 w-6" />
        </span>
      </a>

      <a
        href={whatsappLink(
          `Hello ${SHOP.name} (${SHOP.branch}), I want to order. Please help me.`
        )}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("whatsapp")}
        className="group flex items-center gap-2"
      >
        <span className="hidden rounded-full bg-whatsapp px-3 py-1.5 text-sm font-semibold text-white opacity-0 shadow-md transition group-hover:opacity-100 sm:block">
          {t("whatsapp")}
        </span>
        <span className="grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-white shadow-lg ring-4 ring-cream transition hover:scale-105 hover:brightness-105">
          <WhatsappIcon className="h-7 w-7" />
        </span>
      </a>
    </div>
  );
}
