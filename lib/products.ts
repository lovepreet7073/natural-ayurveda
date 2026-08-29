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
