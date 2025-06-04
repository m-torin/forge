'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  title: string;
  image: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mock cart storage - in production use Redis or database
const carts = new Map<string, Cart>();

async function getOrCreateCart(): Promise<Cart> {
  const cookieStore = await cookies();
  let cartId = cookieStore.get('cartId')?.value;
  
  if (!cartId || !carts.has(cartId)) {
    cartId = `cart_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const newCart: Cart = {
      id: cartId,
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    carts.set(cartId, newCart);
    
    // Set cookie that expires in 30 days
    cookieStore.set('cartId', cartId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  
  return carts.get(cartId)!;
}

function calculateCartTotals(cart: Cart): Cart {
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;
  
  return {
    ...cart,
    subtotal,
    tax,
    shipping,
    total,
    updatedAt: new Date(),
  };
}

export async function addToCart(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
  'use server';
  
  const cart = await getOrCreateCart();
  
  // Check if item already exists
  const existingItemIndex = cart.items.findIndex(
    cartItem => 
      cartItem.productId === item.productId &&
      cartItem.size === item.size &&
      cartItem.color === item.color
  );
  
  if (existingItemIndex > -1) {
    // Update quantity
    cart.items[existingItemIndex].quantity += item.quantity || 1;
  } else {
    // Add new item
    cart.items.push({
      ...item,
      quantity: item.quantity || 1,
    });
  }
  
  const updatedCart = calculateCartTotals(cart);
  carts.set(cart.id, updatedCart);
  
  // Revalidate cart page
  revalidatePath('/cart');
  
  return updatedCart;
}

export async function updateCartItem(productId: string, updates: { quantity?: number; size?: string; color?: string }) {
  'use server';
  
  const cart = await getOrCreateCart();
  const itemIndex = cart.items.findIndex(item => item.productId === productId);
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }
  
  if (updates.quantity === 0) {
    // Remove item
    cart.items.splice(itemIndex, 1);
  } else {
    // Update item
    cart.items[itemIndex] = {
      ...cart.items[itemIndex],
      ...updates,
    };
  }
  
  const updatedCart = calculateCartTotals(cart);
  carts.set(cart.id, updatedCart);
  
  revalidatePath('/cart');
  
  return updatedCart;
}

export async function removeFromCart(productId: string) {
  'use server';
  
  return updateCartItem(productId, { quantity: 0 });
}

export async function getCart() {
  'use server';
  
  return getOrCreateCart();
}

export async function clearCart() {
  'use server';
  
  const cart = await getOrCreateCart();
  cart.items = [];
  
  const updatedCart = calculateCartTotals(cart);
  carts.set(cart.id, updatedCart);
  
  revalidatePath('/cart');
  
  return updatedCart;
}

// Server action for applying discount codes
export async function applyDiscountCode(code: string) {
  'use server';
  
  const cart = await getOrCreateCart();
  
  // Mock discount codes
  const discounts: Record<string, number> = {
    'SAVE10': 0.10,
    'SAVE20': 0.20,
    'FREESHIP': -1, // Special code for free shipping
  };
  
  const discount = discounts[code.toUpperCase()];
  
  if (!discount) {
    throw new Error('Invalid discount code');
  }
  
  if (discount === -1) {
    // Free shipping
    cart.shipping = 0;
  } else {
    // Percentage discount
    cart.subtotal = cart.subtotal * (1 - discount);
  }
  
  const updatedCart = calculateCartTotals(cart);
  carts.set(cart.id, updatedCart);
  
  revalidatePath('/cart');
  
  return { cart: updatedCart, discountApplied: code };
}