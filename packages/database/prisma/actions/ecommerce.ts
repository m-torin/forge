"use server";

import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import {
  // Product operations
  findManyProducts,
  findFirstProduct,
  countProducts,
  updateProduct,
  createProduct,
  
  // Brand operations
  findManyBrands,
  findFirstBrand,
  countBrands,
  
  // Collection operations
  findManyCollections,
  findFirstCollection,
  countCollections,
  updateCollection,
  createCollection,
  
  // Category operations
  findManyProductCategories,
  
  // PdpJoin operations
  createPdpJoin,
  findManyPdpJoins,
  deletePdpJoin,
  deleteManyPdpJoins,
} from "../orm/ecommerce";

// Re-export all the individual action functions from old files
export * from "./old/products";
export * from "./old/brands";
export * from "./old/collections";
export * from "./old/pdp-joins";