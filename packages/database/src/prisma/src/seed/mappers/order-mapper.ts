import {
  type Prisma,
  AddressType,
  OrderItemStatus,
  OrderStatus,
  PaymentStatus,
} from '../../../../../prisma-generated/client';

export interface WebappOrder {
  number: string;
  date: string;
  status: string;
  invoiceHref: string;
  totalQuantity: number;
  cost: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    discount: number;
  };
  products: Array<{
    id: string;
    title: string;
    handle: string;
    description: string;
    href: string;
    price: number;
    status: string;
    step: number;
    date: string;
    datetime: string;
    address: string[]; // [name, street, city_state_zip]
    email: string;
    phone: string;
    featuredImage: {
      src: string;
      width: number;
      height: number;
      alt: string;
    };
    quantity: number;
    size: string;
    color: string;
  }>;
}

export function mapWebappOrderToPrisma(
  webappOrder: WebappOrder,
  userId: string,
  addressId: string,
): Prisma.OrderCreateInput {
  // Parse order status from webapp format
  let orderStatus: OrderStatus = OrderStatus.PENDING;
  let paymentStatus: PaymentStatus = PaymentStatus.PENDING;

  if (webappOrder.status.toLowerCase().includes('delivered')) {
    orderStatus = OrderStatus.DELIVERED;
    paymentStatus = PaymentStatus.PAID;
  } else if (webappOrder.status.toLowerCase().includes('shipped')) {
    orderStatus = OrderStatus.SHIPPED;
    paymentStatus = PaymentStatus.PAID;
  } else if (webappOrder.status.toLowerCase().includes('processing')) {
    orderStatus = OrderStatus.PROCESSING;
    paymentStatus = PaymentStatus.PAID;
  }

  // Generate tracking info for shipped/delivered orders
  let trackingNumber: string | undefined;
  let trackingUrl: string | undefined;

  if (orderStatus === OrderStatus.SHIPPED || orderStatus === OrderStatus.DELIVERED) {
    // Generate realistic tracking numbers
    const carriers = ['UPS', 'FedEx', 'USPS', 'DHL'];
    const carrier = carriers[Math.floor(Math.random() * carriers.length)];

    switch (carrier) {
      case 'UPS':
        trackingNumber = `1Z${Math.random().toString(36).substring(2, 9).toUpperCase()}${Math.floor(Math.random() * 10000000)}`;
        trackingUrl = `https://www.ups.com/track?tracknum=${trackingNumber}`;
        break;
      case 'FedEx':
        trackingNumber = `${Math.floor(Math.random() * 900000000000) + 100000000000}`;
        trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
        break;
      case 'USPS':
        trackingNumber = `940${Math.floor(Math.random() * 10000000000000000)}`;
        trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
        break;
      case 'DHL':
        trackingNumber = `${Math.floor(Math.random() * 90000000000) + 10000000000}`;
        trackingUrl = `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
        break;
    }
  }

  // Generate customer notes for some orders
  const customerNotes = [
    'Please leave package at the front door',
    'Ring doorbell twice for delivery',
    'Gift wrapping requested',
    'Fragile items - handle with care',
    'Birthday gift - please include gift receipt',
  ];
  const hasCustomerNote = Math.random() > 0.7; // 30% chance
  const customerNote = hasCustomerNote
    ? customerNotes[Math.floor(Math.random() * customerNotes.length)]
    : undefined;

  return {
    orderNumber: webappOrder.number,
    status: orderStatus,
    paymentStatus,
    currency: 'USD',
    subtotal: webappOrder.cost.subtotal,
    taxAmount: webappOrder.cost.tax,
    shippingAmount: webappOrder.cost.shipping,
    discountAmount: webappOrder.cost.discount,
    total: webappOrder.cost.total,
    shippingMethod: 'Standard Shipping',
    paymentMethod: 'Credit Card',
    trackingNumber,
    customerNotes: customerNote,
    metadata: trackingUrl ? { trackingUrl } : {},
    user: {
      connect: { id: userId },
    },
    shippingAddress: {
      connect: { id: addressId },
    },
    billingAddress: {
      connect: { id: addressId },
    },
    createdAt: new Date(webappOrder.date),
    updatedAt: new Date(webappOrder.date),
  };
}

export function extractOrderAddress(
  webappOrder: WebappOrder,
  userId: string,
): Prisma.AddressCreateInput {
  // Extract address from first product (they all have same address in webapp data)
  const addressData = webappOrder.products[0]?.address || [
    'John Doe',
    '123 Main St',
    'City, ST 12345',
  ];
  const [name, street, cityStateZip] = addressData;

  // Parse name
  const nameParts = name.split(' ');
  const firstName = nameParts[0] || 'John';
  const lastName = nameParts.slice(1).join(' ') || 'Seed';

  // Parse city, state, zip
  const cityStateParts = cityStateZip.split(', ');
  const city = cityStateParts[0] || 'Toronto';
  const stateZipParts = cityStateParts[1]?.split(' ') || ['ON', 'N3Y'];
  const state = stateZipParts[0] || 'ON';
  const postalCode = stateZipParts.slice(1).join(' ') || 'N3Y 4H8';

  return {
    type: AddressType.SHIPPING,
    isDefault: false,
    firstName,
    lastName,
    street1: street,
    city,
    state,
    postalCode,
    country: 'CA', // Canadian address format in webapp data
    isValidated: true,
    validatedAt: new Date(),
    user: {
      connect: { id: userId },
    },
  };
}

export function extractOrderItems(
  webappOrder: WebappOrder,
  orderId: string,
  productMap: Map<string, string>, // handle -> productId mapping
): Prisma.OrderItemCreateInput[] {
  return webappOrder.products.map(product => {
    // Find matching product ID from our seeded products
    const productId = productMap.get(product.handle);

    // Parse item status
    let itemStatus: OrderItemStatus = OrderItemStatus.PENDING;
    if (product.status.toLowerCase().includes('shipped')) {
      itemStatus = OrderItemStatus.FULFILLED;
    } else if (product.status.toLowerCase().includes('preparing')) {
      itemStatus = OrderItemStatus.PROCESSING;
    }

    return {
      productName: product.title,
      variantName: `${product.title} - ${product.color} - ${product.size}`,
      sku: `${product.handle}-${product.color.toLowerCase().replace(/\s+/g, '-')}-${product.size.toLowerCase()}`.toUpperCase(),
      quantity: product.quantity,
      price: product.price,
      total: product.price * product.quantity,
      status: itemStatus,
      order: {
        connect: { id: orderId },
      },
      ...(productId && {
        product: {
          connect: { id: productId },
        },
      }),
    };
  });
}

export function parseOrderDate(dateString: string): Date {
  // Handle webapp date format like "March 22, 2025"
  try {
    return new Date(dateString);
  } catch {
    return new Date(); // fallback to current date
  }
}
