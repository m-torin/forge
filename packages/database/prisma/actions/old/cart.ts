"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export interface CartItem {
  color?: string;
  image: string;
  price: number;
  productId: string;
  quantity: number;
  size?: string;
  title: string;
  variantId?: string;
}

export interface Cart {
  createdAt: Date;
  id: string;
  items: CartItem[];
  shipping: number;
  subtotal: number;
  tax: number;
  total: number;
  updatedAt: Date;
}

// In-memory cart storage - in production use Redis or database
const carts = new Map<string, Cart>();

async function getOrCreateCart(): Promise<Cart> {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("cartId")?.value;

  if (!cartId || !carts.has(cartId)) {
    cartId = `cart_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const newCart: Cart = {
      id: cartId,
      createdAt: new Date(),
      items: [],
      shipping: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
      updatedAt: new Date(),
    };
    carts.set(cartId, newCart);

    // Set cookie that expires in 30 days
    cookieStore.set("cartId", cartId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return carts.get(cartId)!;
}

function calculateCartTotals(cart: Cart): Cart {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  return {
    ...cart,
    shipping,
    subtotal,
    tax,
    total,
    updatedAt: new Date(),
  };
}

export async function addToCart(
  item: Omit<CartItem, "quantity"> & { quantity?: number },
) {
  "use server";

  const cart = await getOrCreateCart();

  // Check if item already exists
  const existingItemIndex = cart.items.findIndex(
    (cartItem) =>
      cartItem.productId === item.productId &&
      cartItem.size === item.size &&
      cartItem.color === item.color &&
      cartItem.variantId === item.variantId,
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
  revalidatePath("/cart");
  revalidatePath("/[locale]/cart");

  return updatedCart;
}

export async function updateCartItem(
  productId: string,
  updates: { 
    quantity?: number; 
    size?: string; 
    color?: string;
    variantId?: string;
  },
) {
  "use server";

  const cart = await getOrCreateCart();
  const itemIndex = cart.items.findIndex(
    (item) => item.productId === productId && 
              (!updates.variantId || item.variantId === updates.variantId),
  );

  if (itemIndex === -1) {
    throw new Error("Item not found in cart");
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

  revalidatePath("/cart");
  revalidatePath("/[locale]/cart");

  return updatedCart;
}

export async function removeFromCart(productId: string, variantId?: string) {
  "use server";

  const cart = await getOrCreateCart();
  const itemIndex = cart.items.findIndex(
    (item) => item.productId === productId && 
              (!variantId || item.variantId === variantId),
  );

  if (itemIndex === -1) {
    throw new Error("Item not found in cart");
  }

  cart.items.splice(itemIndex, 1);

  const updatedCart = calculateCartTotals(cart);
  carts.set(cart.id, updatedCart);

  revalidatePath("/cart");
  revalidatePath("/[locale]/cart");

  return updatedCart;
}

export async function getCart() {
  "use server";

  return getOrCreateCart();
}

export async function clearCart() {
  "use server";

  const cart = await getOrCreateCart();
  cart.items = [];

  const updatedCart = calculateCartTotals(cart);
  carts.set(cart.id, updatedCart);

  revalidatePath("/cart");
  revalidatePath("/[locale]/cart");

  return updatedCart;
}

// Server action for applying discount codes
export async function applyDiscountCode(code: string) {
  "use server";

  const cart = await getOrCreateCart();

  // Mock discount codes - in production, validate against database
  const discounts: Record<string, number> = {
    FREESHIP: -1, // Special code for free shipping
    SAVE10: 0.1,
    SAVE20: 0.2,
  };

  const discount = discounts[code.toUpperCase()];

  if (!discount) {
    throw new Error("Invalid discount code");
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

  revalidatePath("/cart");
  revalidatePath("/[locale]/cart");

  return { cart: updatedCart, discountApplied: code };
}