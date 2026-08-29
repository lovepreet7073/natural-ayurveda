import type { Metadata } from "next";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { T } from "@/components/t";

export const metadata: Metadata = { title: "All Products" };

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-center font-serif text-3xl font-bold text-leaf sm:text-4xl">
        <T k="allProducts" />
      </h1>
      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {products.map((product, i) => (
          <ProductCard key={product.slug} product={product} priority={i < 4} />
        ))}
      </div>
    </div>
  );
}
