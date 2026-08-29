"use client";

import { useT, type MessageKey, type Vars } from "@/lib/i18n";

/** Renders one translated string. Exists so that server components — the home
 *  page, the product pages — can drop a translated leaf into otherwise static
 *  markup without becoming client components themselves. */
export function T({ k, vars }: { k: MessageKey; vars?: Vars }) {
  const t = useT();
  return <>{t(k, vars)}</>;
}
