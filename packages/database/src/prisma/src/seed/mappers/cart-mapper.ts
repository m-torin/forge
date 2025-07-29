import { type Prisma, CartStatus } from '../../../../../prisma-generated/client';

export interface WebappCart {
  id: string;
  note: string;
  createdAt: string;
  totalQuantity: number;
  cost: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    discount: number;
  };
  lines: Array<{
    id: string;
    name: string;
    handle: string;
    price: number;
    color: string;
    inStock: boolean;
    leadTime?: string;
    size: string;
    quantity: number;
    image: {
      src: string;
      width: number;
      height: number;
      alt: string;
    };
  }>;
}

export function mapWebappCartToPrisma(
  webappCart: WebappCart,
  userId: string,
): Prisma.CartCreateInput {
  return {
    status: CartStatus.ACTIVE,
    currency: 'USD',
    notes: webappCart.note,
    metadata: {
      totalQuantity: webappCart.totalQuantity,
      cost: webappCart.cost,
      originalId: webappCart.id,
    },
    user: {
      connect: { id: userId },
    },
    createdAt: new Date(webappCart.createdAt),
    updatedAt: new Date(webappCart.createdAt),
  };
}

export function extractCartItems(
  webappCart: WebappCart,
  cartId: string,
  productMap: Map<string, string>, // handle -> productId mapping
): Prisma.CartItemCreateInput[] {
  return webappCart.lines.map(line => {
    // Find matching product ID from our seeded products
    const productId = productMap.get(line.handle);

    return {
      quantity: line.quantity,
      price: line.price,
      savedForLater: !line.inStock, // If not in stock, save for later
      metadata: {
        color: line.color,
        size: line.size,
        inStock: line.inStock,
        leadTime: line.leadTime,
        originalLineId: line.id,
        image: line.image,
      },
      cart: {
        connect: { id: cartId },
      },
      ...(productId && {
        product: {
          connect: { id: productId },
        },
      }),
    };
  });
}

export function findVariantForCartItem(
  line: WebappCart['lines'][0],
  variants: Array<{ id: string; name: string; slug: string; parentId: string | null }>,
): string | null {
  // Try to find a variant that matches the color and size
  const colorSlug = line.color.toLowerCase().replace(/\s+/g, '-');
  const sizeSlug = line.size.toLowerCase();
  const productSlug = line.handle;

  const expectedVariantSlug = `${productSlug}-${colorSlug}-${sizeSlug}`;

  const variant = variants.find(v => v.slug === expectedVariantSlug);
  return variant?.id || null;
}
