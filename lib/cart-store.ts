"use client";

import { useSyncExternalStore } from "react";
import { products } from "@/lib/products";
import { deliveryChargeFor } from "@/lib/shop";

const STORAGE_KEY = "na-cart-v1";
const MAX_QTY = 20;

/** The cart only ever stores slug + qty. Prices always come from the catalogue,
 *  so a stale cart in someone's browser can never charge an old price. */
export type CartLine = { slug: string; qty: number };

export type CartSnapshot = {
  lines: CartLine[];
  /** False until localStorage has been read, so the first paint matches the server. */
  ready: boolean;
};

const EMPTY: CartSnapshot = { lines: [], ready: false };

// localStorage is external state, so it lives outside React and is read through
// useSyncExternalStore. Hydrating inside an effect would set state during render
// commit, which React 19 rightly rejects (react-hooks/set-state-in-effect).
let snapshot: CartSnapshot = EMPTY;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

const clampQty = (value: unknown): number =>
  Math.min(MAX_QTY, Math.max(1, Math.trunc(Number(value) || 1)));

function readStored(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((line): line is CartLine => typeof (line as CartLine)?.slug === "string")
      .map((line) => ({ slug: line.slug, qty: clampQty(line.qty) }));
  } catch {
    // A corrupt or unavailable store must never break the shop.
    return [];
  }
}

function persist(lines: CartLine[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Private browsing or a full quota — the cart still works for this session.
  }
}

function setLines(next: CartLine[]): void {
  snapshot = { lines: next, ready: true };
  persist(next);
  emit();
}

function hydrate(): void {
  if (snapshot.ready) return;
  snapshot = { lines: readStored(), ready: true };
}

function subscribe(listener: () => void): () => void {
  // First subscription happens after mount, so this is always client-side.
  hydrate();
  listeners.add(listener);
  // Keep two open tabs in agreement.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = { lines: readStored(), ready: true };
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = (): CartSnapshot => snapshot;
const getServerSnapshot = (): CartSnapshot => EMPTY;

export function addToCart(slug: string, qty = 1): void {
  const existing = snapshot.lines.find((line) => line.slug === slug);
  setLines(
    existing
      ? snapshot.lines.map((line) =>
          line.slug === slug ? { ...line, qty: clampQty(line.qty + qty) } : line
        )
      : [...snapshot.lines, { slug, qty: clampQty(qty) }]
  );
}

export function setCartQty(slug: string, qty: number): void {
  setLines(
    qty <= 0
      ? snapshot.lines.filter((line) => line.slug !== slug)
      : snapshot.lines.map((line) => (line.slug === slug ? { ...line, qty: clampQty(qty) } : line))
  );
}

export function removeFromCart(slug: string): void {
  setLines(snapshot.lines.filter((line) => line.slug !== slug));
}

export function clearCart(): void {
  setLines([]);
}

export type CartLineView = {
  slug: string;
  qty: number;
  name: string;
  price: number;
  image?: string;
};

export type Cart = {
  lines: CartLineView[];
  count: number;
  subtotal: number;
  delivery: number;
  total: number;
  ready: boolean;
};

export function useCart(): Cart {
  const { lines, ready } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Joined to live catalogue data, dropping anything since removed from the shop.
  const view = lines.flatMap((line): CartLineView[] => {
    const product = products.find((p) => p.slug === line.slug);
    if (!product) return [];
    return [
      {
        slug: line.slug,
        qty: line.qty,
        name: product.name,
        price: product.price,
        image: product.images[0]?.src,
      },
    ];
  });

  const subtotal = view.reduce((sum, line) => sum + line.price * line.qty, 0);
  const delivery = view.length ? deliveryChargeFor(subtotal) : 0;

  return {
    lines: view,
    count: view.reduce((sum, line) => sum + line.qty, 0),
    subtotal,
    delivery,
    total: subtotal + delivery,
    ready,
  };
}
