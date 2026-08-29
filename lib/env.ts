/**
 * The only place in the app that reads `process.env` (SEC-1).
 *
 * Deviation from SEC-1: the rule calls for a Zod parse at boot. Zod is not yet a
 * dependency here and SEC-13 forbids adding one unasked, so the checks below are
 * hand-written to the same effect. Swap them for a Zod schema the moment Zod
 * arrives for the checkout form (UI-4 / API-8).
 *
 * Nothing here is required: with an empty environment the shop still takes orders
 * and shows the WhatsApp fallback. Missing values degrade a channel, never the sale.
 */

const optional = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** https everywhere, with http allowed only for a loopback host — that traffic
 *  never leaves the machine, so it is a dev affordance rather than a relaxed
 *  check. A plain-http remote URL is still rejected. */
function requireHttpsUrl(value: string | undefined, name: string): string | null {
  const raw = optional(value);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const loopback = url.protocol === "http:" && LOCAL_HOSTS.has(url.hostname);
    if (url.protocol !== "https:" && !loopback) throw new Error("must be https");
    return raw;
  } catch {
    console.error(`[env] ${name} is not a valid https URL — that channel is disabled`);
    return null;
  }
}

function requireDigits(value: string | undefined, name: string, fallback: string): string {
  const raw = optional(value);
  if (!raw) return fallback;
  if (!/^\d{10,15}$/.test(raw)) {
    console.error(`[env] ${name} must be digits only with country code — using the default`);
    return fallback;
  }
  return raw;
}

/** Owner's WhatsApp Business number. Also read on the client, hence NEXT_PUBLIC_. */
export const WHATSAPP_NUMBER = requireDigits(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  "NEXT_PUBLIC_WHATSAPP_NUMBER",
  "916284226783"
);

/** Server-only. Never import these into a client component. */
export const serverEnv = {
  sheetWebhookUrl: requireHttpsUrl(process.env.ORDER_SHEET_WEBHOOK_URL, "ORDER_SHEET_WEBHOOK_URL"),
  sheetSecret: optional(process.env.ORDER_SHEET_SECRET),
  resendApiKey: optional(process.env.RESEND_API_KEY),
  ownerEmail: optional(process.env.OWNER_EMAIL) ?? "sharanpreetkaur683@gmail.com",
  emailFrom: optional(process.env.ORDER_EMAIL_FROM) ?? "Orders <onboarding@resend.dev>",
} as const;

/**
 * One line at startup saying which channels are actually configured. Reports
 * presence and nothing else — never a value, never a fragment of one (SEC-8) —
 * so "why did my order not reach the Sheet" is answerable without anyone opening
 * an env file.
 */
const describe = (value: string | null): string =>
  value === null ? "OFF (not set or invalid)" : "ON";

console.info(
  [
    "[env] order channels:",
    `sheet=${describe(serverEnv.sheetWebhookUrl)}`,
    `sheetSecret=${describe(serverEnv.sheetSecret)}`,
    `email=${describe(serverEnv.resendApiKey)}`,
  ].join(" ")
);
