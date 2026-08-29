import Link from "next/link";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { T } from "@/components/t";

import type { MessageKey } from "@/lib/dictionary";

const STEPS: { icon: string; key: MessageKey }[] = [
  { icon: "👆", key: "step1" },
  { icon: "📝", key: "step2" },
  { icon: "📦", key: "step3" },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-leaf px-4 py-12 text-cream">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base uppercase tracking-widest text-sage">
            <T k="heroKicker" />
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">
            <T k="heroTitle" />
          </h1>
          <p className="mt-4 text-lg text-cream/90">
            <T k="heroSub" />
          </p>
          <Link
            href="/products"
            className="mt-7 inline-block rounded-2xl bg-gold px-10 py-4 text-xl font-bold text-white transition hover:brightness-110"
          >
            <T k="seeProducts" />
          </Link>
        </div>
      </section>

      <section className="border-b border-cream-deep bg-white px-4 py-4">
        <ul className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-8 gap-y-2 text-center text-base font-semibold text-leaf">
          <li>
            ✅ <T k="cod" />
          </li>
          <li>
            🌿 <T k="genuine" />
          </li>
        </ul>
      </section>

      {/* Ordering explained as three pictures before any product is shown — for a
          first-time online buyer this removes most of the hesitation. */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-serif text-3xl font-bold text-leaf">
            <T k="howToOrder" />
            <span className="mt-1 block text-lg font-normal text-bark-soft">
              <T k="howToOrderSub" />
            </span>
          </h2>
          <ol className="mt-7 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.key}
                className="flex flex-col items-center gap-2 rounded-2xl border border-cream-deep bg-white p-5 text-center"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf text-lg font-bold text-cream">
                  {i + 1}
                </span>
                <span aria-hidden className="text-5xl">
                  {step.icon}
                </span>
                <span className="text-lg font-semibold">
                  <T k={step.key} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="products" className="px-4 pb-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-serif text-3xl font-bold text-leaf">
            <T k="ourProducts" />
          </h2>
          <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {products.map((product, i) => (
              <ProductCard key={product.slug} product={product} priority={i < 2} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
