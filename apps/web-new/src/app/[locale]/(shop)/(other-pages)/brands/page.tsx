import { type Metadata } from "next";
import Link from "next/link";

import {
  Breadcrumb,
} from "@repo/design-system/mantine-ciseco";

export const metadata: Metadata = {
  description: "Explore all our brands",
  title: "Brands",
};

// Mock data - replace with real API calls
async function getBrands() {
  return [
    { id: "1", name: "Nike", productCount: 1250, slug: "nike" },
    { id: "2", name: "Adidas", productCount: 980, slug: "adidas" },
    { id: "3", name: "Puma", productCount: 650, slug: "puma" },
    { id: "4", name: "New Balance", productCount: 450, slug: "new-balance" },
    { id: "5", name: "Under Armour", productCount: 380, slug: "under-armour" },
    { id: "6", name: "Reebok", productCount: 320, slug: "reebok" },
  ];
}

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const brands = await getBrands();

  return (
    <div className="container py-16 lg:py-28">
      <div className="space-y-10 lg:space-y-14">
        <div className="max-w-screen-sm">
          <Breadcrumb
            items={[{ name: "Home", href: `/${locale}` }, { name: "Brands" }]}
          />
          <h1 className="mt-4 text-3xl font-semibold md:text-4xl">
            Shop by Brand
          </h1>
          <span className="mt-4 block text-neutral-500 dark:text-neutral-400">
            Discover products from your favorite brands
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/${locale}/brands/${brand.slug}`}
              className="group relative flex h-40 items-center justify-center rounded-2xl border-2 border-neutral-200 bg-neutral-50 p-6 transition-all hover:border-primary-500 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {brand.name}
                </h3>
                <span className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {brand.productCount} products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
