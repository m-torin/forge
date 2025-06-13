'use server';

// App-specific server action wrappers for client components
// These are only needed when client components need to call data-service functions
// For database actions, import directly from @repo/database/prisma
import {
  getCart as getCartFromService,
  getProducts as getProductsFromService,
  getNavigation as getNavigationFromService,
} from '@/data/data-service';

export async function getCartAction() {
  try {
    const cart = await getCartFromService();
    return cart;
  } catch (error: any) {
    console.error('Failed to fetch cart:', error);
    return null;
  }
}

export async function getProductsAction() {
  try {
    const products = await getProductsFromService();
    return products;
  } catch (error: any) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function getNavigationAction() {
  try {
    const navigation = await getNavigationFromService();
    return navigation;
  } catch (error: any) {
    console.error('Failed to fetch navigation:', error);
    return [];
  }
}
