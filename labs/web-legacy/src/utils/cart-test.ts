/**
 * Test utilities to verify cart functionality for guest users
 */

import type { CartItem } from '@/react/GuestActionsContext';

// Mock cart data for testing
export const mockCartItem: CartItem = {
  productId: 'test-product-1',
  quantity: 1,
  price: 29.99,
  name: 'Test Product',
  image: '/test-image.jpg',
  metadata: {
    color: 'Blue',
    size: 'Medium',
  },
};

// Verify localStorage is available
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// Test guest cart persistence
export function testGuestCartPersistence(): boolean {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available');
    return false;
  }

  try {
    // Save test cart
    const testCart = [mockCartItem];
    localStorage.setItem('guest-cart', JSON.stringify(testCart));

    // Read it back
    const savedCart = localStorage.getItem('guest-cart');
    if (!savedCart) {
      console.error('Failed to save cart to localStorage');
      return false;
    }

    const parsedCart = JSON.parse(savedCart);
    if (!Array.isArray(parsedCart) || parsedCart.length !== 1) {
      console.error('Cart data is corrupted');
      return false;
    }

    // Clean up
    localStorage.removeItem('guest-cart');

    console.log('Guest cart persistence test passed');
    return true;
  } catch (error) {
    console.error('Guest cart persistence test failed:', error);
    return false;
  }
}
