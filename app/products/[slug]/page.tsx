import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { discountPercent, getProduct, products } from "@/lib/products";
import { AddToCart } from "@/components/add-to-cart";
import { T } from "@/components/t";
import { chargesDelivery, DELIVERY, formatINR } from "@/lib/shop";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return { title: product.name, description: product.short };
}

export default async function ProductPage({ params }: Params) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const off = discountPercent(product);
  const freeDelivery = !chargesDelivery || product.price >= DELIVERY.freeAbove;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link href="/products" className="inline-block text-base font-semibold text-leaf">
        ← <T k="backToProducts" />
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          {product.images[0] && (
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-cream-deep bg-white">
              <Image
                src={product.images[0].src}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                priority
                className="object-cover"
              />
            </div>
          )}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img) => (
                <div
                  key={img.src}
                  className="relative aspect-square overflow-hidden rounded-xl border border-cream-deep bg-white"
                >
                  <Image
                    src={img.src}
                    alt={product.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <h1 className="font-serif text-2xl font-bold leading-snug text-bark sm:text-3xl">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-4xl font-bold text-leaf">{formatINR(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-xl text-bark-soft line-through">{formatINR(product.mrp)}</span>
                {off !== null && (
                  <span className="rounded-lg bg-gold px-2.5 py-1 text-base font-bold text-white">
                    <T k="percentOff" vars={{ off }} />
                  </span>
                )}
              </>
            )}
          </div>

          <p className="rounded-xl bg-white px-4 py-3 text-base font-semibold text-leaf">
            ✅ <T k="codExplain" />
            {chargesDelivery && !freeDelivery && (
              <span className="mt-1 block font-normal text-bark-soft">
                <T
                  k="deliveryCharge"
                  vars={{
                    charge: formatINR(DELIVERY.charge),
                    free: formatINR(DELIVERY.freeAbove),
                  }}
                />
              </span>
            )}
          </p>

          <AddToCart product={product} />
        </div>
      </div>

      <section className="mt-10 rounded-2xl border border-cream-deep bg-white p-5 sm:p-7">
        <h2 className="font-serif text-2xl font-bold text-leaf">
          <T k="productDetails" />
        </h2>
        {/* Copy comes from the source catalogue and exists only in English. */}
        <div className="mt-4 space-y-2.5" lang="en">
          {product.description.map((line, i) => {
            const isHeading = line.endsWith(":");
            return (
              <p
                key={i}
                className={
                  isHeading
                    ? "pt-2 text-lg font-bold text-bark"
                    : "text-base text-bark-soft sm:text-[17px]"
                }
              >
                {line}
              </p>
            );
          })}
        </div>
      </section>
    </div>
  );
}
