"use server";

// App-specific server action wrappers for client components
// These are only needed when client components need to call data-service functions
// For database actions, import directly from @repo/database/prisma/actions
import { 
  getCart as getCartFromService, 
  getProducts as getProductsFromService,
  getNavigation as getNavigationFromService 
} from "@/data/data-service";

export async function getCartAction(cartId: string) {
  try {
    const cart = await getCartFromService(cartId);
    return cart;
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return null;
  }
}

export async function getProductsAction() {
  try {
    const products = await getProductsFromService();
    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function getNavigationAction() {
  try {
    const navigation = await getNavigationFromService();
    return navigation;
  } catch (error) {
    console.error("Failed to fetch navigation:", error);
    return [];
  }
}