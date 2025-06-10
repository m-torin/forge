"use server";

import { revalidateTag } from "next/cache";
import {
  createPdpJoin,
  findManyPdpJoins,
  deletePdpJoin,
  deleteManyPdpJoins,
} from "../../orm/ecommerce";

// Create a product-brand association
export async function createProductBrandAssociation(
  productId: string,
  brandId: string,
) {
  "use server";

  const pdpJoin = await createPdpJoin({
    data: {
      productId,
      brandId,
    },
  });

  // Revalidate caches
  revalidateTag(`product-${productId}`);
  revalidateTag(`brand-${brandId}`);
  revalidateTag("products");

  return pdpJoin;
}

// Create multiple product-brand associations
export async function createProductBrandAssociations(
  productId: string,
  brandIds: string[],
) {
  "use server";

  const associations = await Promise.all(
    brandIds.map(brandId =>
      createPdpJoin({
        data: {
          productId,
          brandId,
        },
      }),
    ),
  );

  // Revalidate caches
  revalidateTag(`product-${productId}`);
  brandIds.forEach(brandId => revalidateTag(`brand-${brandId}`));
  revalidateTag("products");

  return associations;
}

// Update product brands (replace all)
export async function updateProductBrands(
  productId: string,
  brandIds: string[],
) {
  "use server";

  // Delete existing associations
  await deleteManyPdpJoins({
    where: { productId },
  });

  // Create new associations
  const associations = brandIds.length > 0
    ? await Promise.all(
        brandIds.map(brandId =>
          createPdpJoin({
            data: {
              productId,
              brandId,
            },
          }),
        ),
      )
    : [];

  // Revalidate caches
  revalidateTag(`product-${productId}`);
  revalidateTag("products");

  return associations;
}

// Remove a product-brand association
export async function removeProductBrandAssociation(
  productId: string,
  brandId: string,
) {
  "use server";

  const pdpJoins = await findManyPdpJoins({
    where: {
      productId,
      brandId,
    },
  });

  if (pdpJoins.length > 0) {
    await deletePdpJoin({
      where: { id: pdpJoins[0].id },
    });
  }

  // Revalidate caches
  revalidateTag(`product-${productId}`);
  revalidateTag(`brand-${brandId}`);
  revalidateTag("products");
}

// Get all brand associations for a product
export async function getProductBrands(productId: string) {
  "use server";

  const pdpJoins = await findManyPdpJoins({
    where: { productId },
    include: {
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          status: true,
        },
      },
    },
  });

  return pdpJoins.map(join => join.brand);
}

// Get all product associations for a brand
export async function getBrandProducts(brandId: string) {
  "use server";

  const pdpJoins = await findManyPdpJoins({
    where: { brandId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          category: true,
          price: true,
          status: true,
        },
      },
    },
  });

  return pdpJoins.map(join => join.product);
}