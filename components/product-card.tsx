import Image from "next/image";
import Link from "next/link";
import { discountPercent, type Product } from "@/lib/products";
import { formatINR } from "@/lib/shop";
import { T } from "@/components/t";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const off = discountPercent(product);
  const image = product.images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-cream-deep bg-white transition hover:border-sage hover:shadow-lg"
    >
      <div className="relative aspect-square bg-cream-deep">
        {image ? (
          <Image
            src={image.src}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 300px"
            priority={priority}
            className="object-cover"
          />
        ) : null}
        {off !== null && (
          <span className="absolute left-2 top-2 rounded-lg bg-gold px-2 py-1 text-sm font-bold text-white">
            <T k="percentOff" vars={{ off }} />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-bark sm:text-lg">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-xl font-bold text-leaf sm:text-2xl">{formatINR(product.price)}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-base text-bark-soft line-through">{formatINR(product.mrp)}</span>
          )}
        </div>
        <span className="rounded-xl bg-leaf py-2.5 text-center text-base font-bold text-cream group-hover:bg-leaf-dark">
          <T k="viewAndOrder" />
        </span>
      </div>
    </Link>
  );
}
