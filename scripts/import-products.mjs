// Pulls the live catalogue from the Shopify storefront and writes data/products.json
// plus locally-hosted images, so the shop never depends on their CDN staying up.
// Run with: npm run import
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE = "https://thenaturalayurveda.com/products.json?limit=250";

// A couple of listings on the source site have no usable body copy. Keep the
// replacements here so re-running the import never wipes them out again.
const OVERRIDES = {
  "combo-kit-light-n-care-cream-super": {
    description: [
      "The everyday duo: Light N Care Anti Blemish Cream paired with Super Bright Face Wash, for a routine that cleanses and treats together.",
      "Super Bright Face Wash lifts away dirt, oil and impurities without stripping the skin, leaving it fresh and ready to absorb the cream.",
      "Light N Care Anti Blemish Cream then works on blemishes, dark spots and uneven tone with its ayurvedic formula.",
      "How to use:",
      "• Wash your face with the face wash, morning and night.",
      "• Pat dry, then apply the cream evenly across the face.",
      "• Use consistently for best results.",
    ],
  },
};
const IMAGES_PER_PRODUCT = 5;
// Shopify's CDN resizes on request; we then re-encode to WebP locally. Many of the
// source files are photographs saved as PNG (one was 1.9 MB), which blows past the
// 1 MB asset limit and is painful on a village 3G connection. WebP keeps
// transparency, unlike the CDN's JPEG conversion.
const MAX_IMAGE_WIDTH = 1200;
const WEBP_QUALITY = 80;
const OUT_IMAGES = path.join(process.cwd(), "public", "products");
const OUT_DATA = path.join(process.cwd(), "data", "products.json");

const stripEmoji = (s) => s.replace(/[^\p{L}\p{N}\p{P}\p{Zs}+]/gu, "");

const tidy = (s) => stripEmoji(s).replace(/\s+/g, " ").replace(/\s+([,.)])/g, "$1").trim();

// Shopify titles are a mix of ALL CAPS and sentence case — normalise the shouty ones.
const titleCase = (s) =>
  s
    .split(" ")
    .map((w) =>
      w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w)
        ? w[0] + w.slice(1).toLowerCase()
        : w
    )
    .join(" ");

const slugify = (s) =>
  stripEmoji(s)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .slice(0, 7)
    .join("-");

// body_html -> array of clean paragraphs
function htmlToParagraphs(html) {
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h\d)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  return text
    .split("\n")
    .map((l) => tidy(l))
    .filter((l) => l.length > 1);
}

/** Ask the CDN for a resized copy rather than storing the full-resolution original. */
function resized(src) {
  const url = new URL(src);
  url.searchParams.set("width", String(MAX_IMAGE_WIDTH));
  return url.toString();
}

async function downloadImage(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  const encoded = await sharp(Buffer.from(await res.arrayBuffer()))
    .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  await writeFile(dest, encoded);
  const meta = await sharp(encoded).metadata();
  return { width: meta.width ?? null, height: meta.height ?? null };
}

const res = await fetch(SOURCE, { headers: { "User-Agent": "Mozilla/5.0" } });
if (!res.ok) throw new Error(`Source returned ${res.status}`);
const { products: raw } = await res.json();

await mkdir(OUT_IMAGES, { recursive: true });
await mkdir(path.dirname(OUT_DATA), { recursive: true });

const products = [];

for (const p of raw) {
  const variant = p.variants?.[0];
  if (!variant) continue;

  const name = titleCase(tidy(p.title));
  const slug = slugify(p.title);
  const paragraphs = htmlToParagraphs(p.body_html || "");

  // The first paragraph is usually a repeat of the title — drop it if so.
  const body =
    paragraphs.length > 1 && paragraphs[0].toLowerCase().startsWith(name.slice(0, 15).toLowerCase())
      ? paragraphs.slice(1)
      : paragraphs;

  const images = [];
  for (const [i, img] of (p.images || []).slice(0, IMAGES_PER_PRODUCT).entries()) {
    const file = `${slug}-${i + 1}.webp`;
    try {
      const size = await downloadImage(resized(img.src), path.join(OUT_IMAGES, file));
      images.push({ src: `/products/${file}`, ...size });
      process.stdout.write(".");
    } catch (err) {
      console.warn(`\n  skipped image for ${slug}: ${err.message}`);
    }
  }

  const override = OVERRIDES[slug] ?? {};
  const description = override.description ?? body;

  products.push({
    slug,
    name,
    price: Math.round(Number(variant.price)),
    mrp: variant.compare_at_price ? Math.round(Number(variant.compare_at_price)) : null,
    short: override.short ?? description[0]?.slice(0, 160) ?? "",
    description,
    images,
    inStock: true,
  });
}

// Cheapest-looking singles first reads badly on a shop page; keep source order but
// push the combo kits down so individual products lead.
products.sort((a, b) => Number(/combo|kit/i.test(a.name)) - Number(/combo|kit/i.test(b.name)));

await writeFile(OUT_DATA, JSON.stringify(products, null, 2) + "\n");
console.log(`\nWrote ${products.length} products to data/products.json`);
