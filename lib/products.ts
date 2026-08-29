import data from "@/data/products.json";

export type ProductImage = {
  src: string;
  width: number | null;
  height: number | null;
};

export type Product = {
  slug: string;
  name: string;
  price: number;
  mrp: number | null;
  short: string;
  description: string[];
  images: ProductImage[];
  inStock: boolean;
};

export const products = data as Product[];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function discountPercent(p: Product): number | null {
  if (!p.mrp || p.mrp <= p.price) return null;
  return Math.round(((p.mrp - p.price) / p.mrp) * 100);
}

/**
 * Short names for the order sheet, which gives every product its own quantity
 * column — the same shape as the Excel file she keeps today ("Cream", "Facewash",
 * "Sunscreen"). Full catalogue titles are far too long for a column heading, and
 * she needs to read a row at a glance.
 *
 * Adding a product means adding its label here AND to PRODUCT_COLUMNS in
 * apps-script/Code.gs, in the same order.
 */
const SHEET_LABELS: Record<string, string> = {
  "light-n-care-anti-blemish-cream-ayurvedic": "Cream",
  "hydrating-sunscreen-tinted-the-flawless-glow-of": "Sunscreen",
  "light-n-care-lightening-and-hydrating-lip": "Lip Balm",
  "rakta-mantra-it-cares-for-your-skin": "Rakta Mantra",
  "liver-amrit-syrup-27-super-herbs-double": "Liver Amrit",
  "hair-care-oil-goodnesss-of-ayurveda-with": "Hair Oil",
  "d-tan-kit-aloevera-neem-papaya-orange": "D-Tan Kit",
  "light-n-care-combo-kit-cream-face": "Full Kit",
  "combo-kit-light-n-care-cream-super": "Combo Kit",
};

/** Sheet column order for the per-product quantity columns. */
export const SHEET_PRODUCT_SLUGS: string[] = Object.keys(SHEET_LABELS);

export function sheetLabel(slug: string): string {
  return SHEET_LABELS[slug] ?? slug;
}
