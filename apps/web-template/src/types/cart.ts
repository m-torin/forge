/**
 * Cart Type Definitions
 */

export interface TCartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  isGift: boolean;
  giftMessage: string | null;
  registryId: string | null;
  savedForLater: boolean;
  product: {
    id: string;
    name: string;
    sku: string;
    image: string | null;
    slug: string;
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
    attributes: any;
  };
}

export interface TCart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  status: 'ACTIVE' | 'ABANDONED' | 'CONVERTED' | 'MERGED';
  currency: string;
  notes: string | null;
  metadata: any;
  items: TCartItem[];
  subtotal: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TCartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
}
