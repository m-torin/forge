import { type Metadata } from "next";

import {
  getProducts,
} from "@repo/design-system/mantine-ciseco";

import { FavoritesClient } from "./FavoritesClient";

export const metadata: Metadata = {
  description: "Your favorite products and wishlists",
  title: "My Favorites",
};

const Page = async () => {
  // Get all products to filter by favorites on client side
  const allProducts = await getProducts();

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">My Favorites</h1>
        <p className="mt-2.5 text-neutral-500 dark:text-neutral-400">
          Products you've saved for later. Click the heart icon on any product
          to add it here.
        </p>
      </div>

      <FavoritesClient allProducts={allProducts} />
    </div>
  );
};

export default Page;
