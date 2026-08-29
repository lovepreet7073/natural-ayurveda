import type { Metadata } from "next";
import { Lora } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Header } from "@/components/header";
import { ContactFab } from "@/components/contact-fab";
import { T } from "@/components/t";
import { SHOP } from "@/lib/shop";

const lora = Lora({ subsets: ["latin"], variable: "--font-lora", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: `${SHOP.name} — Ayurvedic Skin & Hair Care`,
    template: `%s | ${SHOP.name}`,
  },
  description: SHOP.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={lora.variable}>
      <body className="flex min-h-dvh flex-col text-[17px] leading-relaxed">
        <Header />
        <main className="flex-1">{children}</main>

        <footer className="border-t border-cream-deep bg-cream-deep/60 px-4 pb-24 pt-8">
          <div className="mx-auto max-w-5xl space-y-3 text-center">
            <p className="font-serif text-xl font-semibold text-leaf">{SHOP.name}</p>
            <p className="text-bark-soft">
              <T k="branchLabel" />: {SHOP.branch}
            </p>
            <p className="text-bark-soft">
              <T k="heroTitle" />
            </p>
            <p className="text-bark-soft">
              <T k="helpContact" vars={{ name: SHOP.owner }} />
            </p>
            <p className="text-bark-soft">
              <T k="callOrWhatsapp" />{" "}
              <a href={`tel:+${SHOP.whatsapp}`} className="font-semibold text-leaf">
                {SHOP.phoneDisplay}
              </a>
            </p>
            <p className="pt-2">
              <Link href="/products" className="font-semibold text-leaf underline">
                <T k="allProducts" />
              </Link>
            </p>
          </div>
        </footer>

        <ContactFab />
      </body>
    </html>
  );
}
