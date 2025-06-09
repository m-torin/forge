"use server";

import {
  getCart as getCartFromService,
  getNavigation as getNavigationFromService,
  getProducts as getProductsFromService,
} from "@/lib/data-service";

/**
 * Server action wrapper for getCart
 * Allows client components to safely fetch cart data
 */
export async function getCartAction(cartId: string) {
  try {
    const cart = await getCartFromService(cartId);
    return cart;
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return null;
  }
}

/**
 * Server action wrapper for getNavigation
 * Allows client components to safely fetch navigation data
 */
export async function getNavigationAction() {
  try {
    const navigation = await getNavigationFromService();
    return navigation;
  } catch (error) {
    console.error("Failed to fetch navigation:", error);
    return [];
  }
}

/**
 * Server action wrapper for getProducts
 * Allows client components to safely fetch products data
 */
export async function getProductsAction() {
  try {
    const products = await getProductsFromService();
    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}
