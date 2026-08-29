# Natural Ayurveda — online shop

A small cash-on-delivery shop for the **Natural Ayurveda Kurali, Punjab branch**,
run by **Sharanpreet Kaur** (+91 62842 26783). Her name and branch appear wherever
a customer might need help. Both are set once in [lib/shop.ts](lib/shop.ts). Customers browse products, place an order, and the
order lands in a Google Sheet plus an email. No payment gateway, no customer
logins, no admin panel to learn.

Built for customers with low digital confidence: large text and buttons, only the
essential fields, a three-language switcher, and a Call / WhatsApp bar fixed to the
bottom of every page so anyone can reach a human in one tap.

## Languages

The whole interface reads in **English (default), Hindi (हिंदी) or Punjabi
(ਪੰਜਾਬੀ)**. The switcher sits in the header, each language written in its own
script so a customer recognises theirs without reading the other two. The choice
is remembered in the browser.

Every string lives in [lib/dictionary.ts](lib/dictionary.ts) — add or reword one
there and all three languages stay side by side in the same block. To add a fourth
language, add its code to `LANGUAGES` and fill in the entries.

Two deliberate limits:

- **Product names and descriptions stay in English.** They come from the Shopify
  catalogue, and machine-translating medicine copy is not something to do quietly.
  Send their translations over and they can be added to `data/products.json`.
- **Validation errors are sent by the server as keys, not sentences** (`errPhone`,
  not "Enter a 10 digit number"), so the browser renders them in the language the
  customer picked. Keep that shape if you add new checks in `lib/order.ts`.

## Running it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Other commands:

| Command | What it does |
|---|---|
| `npm run import` | Re-pulls products, prices and photos from thenaturalayurveda.com |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |

## Changing products and prices

Everything the shop sells lives in [data/products.json](data/products.json) — one
entry per product. To change a price, edit the `price` number and redeploy. There
is no database and no admin screen, which is deliberate: at nine products, a file
is less to go wrong than a CMS.

To re-sync from the main Shopify site (new products, updated photos):

```bash
npm run import
```

That rewrites `data/products.json` and re-downloads every photo into
`public/products/`, resized to 1200px and re-encoded as WebP so pages stay light
on a slow connection. Hand-written copy for products the source site leaves blank
is preserved in the `OVERRIDES` map at the top of
[scripts/import-products.mjs](scripts/import-products.mjs).

## Prices and delivery

Prices match thenaturalayurveda.com exactly — no rounding, no markup. `npm run
import` re-syncs them whenever the main site changes.

**Delivery is included in the product price and is never mentioned on the site.**
The customer pays exactly the listed price — no delivery row in the cart, no
delivery line at checkout, no "free delivery" badge, no spend threshold. The only
places the word "delivery" still appears are "Cash on Delivery" and the "Delivery
Address" form heading, which are about payment and address, not shipping cost.

To start charging for delivery, set `charge` above zero in
[lib/shop.ts](lib/shop.ts) — `freeAbove` then becomes the order value at which it
is waived, and every delivery line in the UI switches itself back on. Nothing else
needs touching.

## The order form matches her phone script

The checkout fields are, one for one and in the same order, the address format she
already sends customers on WhatsApp:

| Field | Required |
|---|---|
| Name | yes |
| Father's / Husband's Name | yes |
| House No. / Flat No. | no |
| Village / Area / Colony | yes |
| Street / Road | no |
| Near By / Landmark | yes |
| Post Office (PO) | yes |
| Tehsil | no |
| District | yes |
| State | yes |
| Pincode | yes |
| Phone No. | yes |
| Another number, Message | no |

The optional ones are exactly the ones her own template marks optional. Required
fields are marked with a red `*` and checked as the customer leaves each one, so a
mistake shows next to the field that caused it rather than all at once at the end.
Submitting with anything missing focuses the first bad field.

### PIN code check

Typing the sixth digit of the PIN code looks it up against India Post
(`api.postalpincode.in` — free, no key, proxied through
[app/api/pincode/[pin]/route.ts](app/api/pincode/%5Bpin%5D/route.ts) and cached for
a month).

- A valid PIN fills in **District** and **State** and turns **Post Office** into a
  dropdown of the offices that actually serve that PIN. For 141008 that is 16
  real options, so the customer picks rather than spells.
- An unknown PIN says so immediately, before the order is placed.
- If India Post is unreachable the form says so and lets them type the address
  themselves — a third-party outage must never block a sale.

This is why PIN code is asked *before* Post Office, District and State on the
form, which is the one place the field order differs from her template. What she
reads back — the WhatsApp message, the email, the Sheet — is still in her order. An order
from the website therefore reads identically to one she took by phone — same
fields, same order, same wording — in the WhatsApp message, in the email and in
the Google Sheet columns.

A single freeform "address" box was the earlier design and was wrong: couriers in
this area need Post Office and District as separate lines. Twelve fields is more
typing than a low-literacy customer wants, so the form is split into three headed
sections and short fields sit two per row — and anyone who will not fill a form at
all still has the WhatsApp and Call buttons on every page.

If you add a field, add it in the same order to `CustomerDetails` and
`addressLines()` in [lib/order.ts](lib/order.ts), `SECTIONS` in
[app/checkout/page.tsx](app/checkout/page.tsx), and `COLUMNS`/`HEADINGS` in
[apps-script/Code.gs](apps-script/Code.gs).

## Payment: cash on delivery, and optionally UPI

Cash on delivery is the default and needs no setup. A UPI option can sit next to
it, but it is **off until real details are filled into `UPI` in
[lib/shop.ts](lib/shop.ts)**: `payeeName`, `upiId`, and a QR picture dropped into
`public/`. Until then the checkout shows nothing about payment at all.

Once on, a customer choosing UPI gets:

- a **"Pay ₹X in your UPI app"** button — a `upi://pay` deep link that opens GPay,
  PhonePe or Paytm with the payee and amount already filled, so nothing is typed
  or scanned on a phone;
- the QR picture underneath, for scanning from a second device;
- a required **UPI Reference Number** box.

### What this is not

This is a plain UPI collect, **not a payment gateway**. The site cannot see
whether money actually arrived — it only records the reference the customer typed,
and a customer can type a made-up one.

So a UPI order lands in the Sheet with Status **"Payment to verify"**, never
"New", and the WhatsApp summary reads `Paid by UPI: ₹299 — REF … (CHECK BEFORE
SENDING)`. Someone must open the receiving UPI app and confirm the money is there
before the parcel goes out. Nothing in the code treats a UPI order as paid.

`payeeName` must match the name the customer's UPI app displays. If the receiving
account belongs to someone else, the customer sees that other name when they tap
pay — which reads as a scam and loses the sale. Use an account whose display name
the customer will recognise.

## Where orders go

When someone places an order the site does three things, and **none of them can
fail the order**:

1. **Appends a row to a Google Sheet** — the order book. She opens Google Sheets
   on her phone, sees the new row, taps the **CALL** link in that row to ring the
   customer, then sets the Status dropdown to Confirmed / Packed / Shipped /
   Delivered.
2. **Emails her** a plain-text copy of the order.
3. **Shows the customer a WhatsApp button** that sends the whole order to her
   number. This is the guaranteed fallback: it works even if the other two are
   not configured at all.

The customer always gets an order number, whatever happens behind the scenes.

### Setting up the Google Sheet (about 5 minutes)

1. Create a new Google Sheet on her Google account.
2. **Extensions → Apps Script**, delete the sample code, paste in
   [apps-script/Code.gs](apps-script/Code.gs).
3. Change the `SECRET` constant to any private phrase.
4. **Deploy → New deployment → Web app**. Execute as *Me*, access *Anyone*.
5. Copy the `/exec` URL it gives you.

Then set `ORDER_SHEET_WEBHOOK_URL` to that URL and `ORDER_SHEET_SECRET` to the
same phrase you chose in step 3.

### Setting up email alerts (optional)

Create a free account at [resend.com](https://resend.com) (3,000 emails/month),
make an API key, and set `RESEND_API_KEY`. Leave `ORDER_EMAIL_FROM` on the
`onboarding@resend.dev` default until a custom domain is verified with them.

## Configuration

See [.env.example](.env.example) for the full list. Every value is optional — a
missing one disables a notification channel, it never blocks a sale. All of them
are read in one place, [lib/env.ts](lib/env.ts).

## Deploying free

1. Push this repo to GitHub.
2. Import it at [vercel.com](https://vercel.com) — the Hobby plan is free and the
   framework is detected automatically.
3. Paste the environment variables into **Settings → Environment Variables**.
4. Deploy. The site is live at `<project-name>.vercel.app`.

Running cost is ₹0: no gateway (cash on delivery), no database, no image host, no
email bill at this volume. The only thing that is not free is a custom domain
(roughly ₹150–800/year for a `.in`) — the `.vercel.app` address works fine until
that is worth buying, and switching later is a DNS change that breaks nothing.

## How it is put together

```
app/
  page.tsx                  home — hero, how-to-order, product grid
  products/                 list and per-product pages (prerendered)
  cart/  checkout/          bag and the order form
  api/order/route.ts        validates, prices, notifies
components/                 header, language switcher, contact bar, product card
lib/
  products.ts               typed access to data/products.json
  cart-store.ts             cart state (useSyncExternalStore over localStorage)
  i18n.ts                   language state + the t() helper
  dictionary.ts             every string, in all three languages
  order.ts                  validation + server-side pricing
  env.ts                    the only module that reads process.env
  shop.ts                   shop identity, delivery rules, money formatting
scripts/import-products.mjs catalogue importer
apps-script/Code.gs         the Google Sheet webhook
```

Two rules worth keeping if you change things:

- **Prices are never trusted from the browser.** The cart stores only `slug` and
  `qty`; `lib/order.ts` looks up the real price server-side. A tampered request
  is priced from the catalogue, not from what it claims.
- **Notification failures are swallowed, not raised.** An order the customer has
  been told is placed must never disappear because an API was slow.

## Known deviations from the Foreman ruleset

- **API-8 / SEC-6 / UI-4** ask for Zod schemas and react-hook-form. Both are new
  runtime dependencies, which SEC-13 says not to add unasked. Validation is
  hand-written in `lib/order.ts` instead and runs on both the client and the
  server. Swap it for Zod when those dependencies are approved.
- **SEC-1** asks for a Zod parse at boot; `lib/env.ts` does equivalent checks by
  hand, for the same reason.
- **SEC-8** says never log PII. `app/api/order/route.ts` deliberately logs the
  full order when *every* notification channel has failed — at that point the log
  is the only surviving copy of an order the customer believes is placed.
