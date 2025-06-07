import type { TestProduct } from "./products";

export interface TestOrderItem {
  price: number;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  subtotal: number;
}

export interface TestOrder {
  billingAddress: TestAddress;
  createdAt: Date;
  currency: string;
  id: string;
  items: TestOrderItem[];
  orderNumber: string;
  paymentMethod: TestPaymentMethod;
  shipping: number;
  shippingAddress: TestAddress;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  updatedAt: Date;
  userId: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface TestAddress {
  city: string;
  country: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  phone?: string;
  postalCode: string;
  state: string;
}

export interface TestPaymentMethod {
  brand?: string;
  email?: string;
  last4?: string;
  type: "card" | "paypal" | "bank_transfer";
}

export const TEST_ADDRESSES: Record<string, TestAddress> = {
  default: {
    city: "New York",
    country: "US",
    firstName: "John",
    lastName: "Doe",
    line1: "123 Main Street",
    line2: "Apt 4B",
    phone: "+1 (555) 123-4567",
    postalCode: "10001",
    state: "NY",
  },
  international: {
    city: "Paris",
    country: "FR",
    firstName: "Pierre",
    lastName: "Dupont",
    line1: "789 Rue de la Paix",
    phone: "+33 1 23 45 67 89",
    postalCode: "75001",
    state: "Île-de-France",
  },
  office: {
    city: "San Francisco",
    country: "US",
    firstName: "Jane",
    lastName: "Smith",
    line1: "456 Business Ave",
    line2: "Suite 200",
    phone: "+1 (555) 987-6543",
    postalCode: "94105",
    state: "CA",
  },
};

export const TEST_PAYMENT_METHODS: Record<string, TestPaymentMethod> = {
  mastercard: {
    type: "card",
    brand: "Mastercard",
    last4: "5555",
  },
  paypal: {
    type: "paypal",
    email: "test@paypal.com",
  },
  visa: {
    type: "card",
    brand: "Visa",
    last4: "4242",
  },
};

export const TEST_ORDERS: Record<string, TestOrder> = {
  cancelled: {
    id: "test-order-003",
    billingAddress: TEST_ADDRESSES.default,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    currency: "USD",
    items: [
      {
        price: 199.99,
        productId: "test-product-004",
        productName: "Limited Edition Sneakers",
        productSku: "SNK-LTD-001",
        quantity: 1,
        subtotal: 199.99,
      },
    ],
    orderNumber: "ORD-2023-003",
    paymentMethod: TEST_PAYMENT_METHODS.mastercard,
    shipping: 0,
    shippingAddress: TEST_ADDRESSES.default,
    status: "cancelled",
    subtotal: 199.99,
    tax: 18.0,
    total: 217.99,
    updatedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 days ago
    userId: "test-user-001",
  },
  completed: {
    id: "test-order-001",
    billingAddress: TEST_ADDRESSES.default,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    currency: "USD",
    items: [
      {
        price: 2499.99,
        productId: "test-product-001",
        productName: 'MacBook Pro 16"',
        productSku: "MBP16-2023-001",
        quantity: 1,
        subtotal: 2499.99,
      },
      {
        price: 29.99,
        productId: "test-product-002",
        productName: "Classic Cotton T-Shirt",
        productSku: "TSH-CTN-BLK-M",
        quantity: 2,
        subtotal: 59.98,
      },
    ],
    orderNumber: "ORD-2023-001",
    paymentMethod: TEST_PAYMENT_METHODS.visa,
    shipping: 15.0,
    shippingAddress: TEST_ADDRESSES.default,
    status: "delivered",
    subtotal: 2559.97,
    tax: 230.4,
    total: 2805.37,
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    userId: "test-user-001",
  },
  processing: {
    id: "test-order-002",
    billingAddress: TEST_ADDRESSES.office,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    currency: "USD",
    items: [
      {
        price: 49.99,
        productId: "test-product-003",
        productName: "The Art of Programming",
        productSku: "BOOK-PROG-001",
        quantity: 1,
        subtotal: 49.99,
      },
    ],
    orderNumber: "ORD-2023-002",
    paymentMethod: TEST_PAYMENT_METHODS.paypal,
    shipping: 5.99,
    shippingAddress: TEST_ADDRESSES.office,
    status: "processing",
    subtotal: 49.99,
    tax: 4.5,
    total: 60.48,
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    userId: "test-user-001",
  },
};

export function createTestOrder(
  userId: string,
  items: TestOrderItem[],
  overrides?: Partial<TestOrder>,
): TestOrder {
  const id = overrides?.id || `test-order-${Date.now()}`;
  const orderNumber = overrides?.orderNumber || `ORD-${Date.now()}`;

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.09; // 9% tax
  const shipping = subtotal > 100 ? 0 : 15.0; // Free shipping over $100
  const total = subtotal + tax + shipping;

  return {
    id,
    billingAddress: TEST_ADDRESSES.default,
    createdAt: new Date(),
    currency: "USD",
    items,
    orderNumber,
    paymentMethod: TEST_PAYMENT_METHODS.visa,
    shipping,
    shippingAddress: TEST_ADDRESSES.default,
    status: "pending",
    subtotal,
    tax,
    total,
    updatedAt: new Date(),
    userId,
    ...overrides,
  };
}

export function createOrderItem(
  product: TestProduct,
  quantity: number,
): TestOrderItem {
  return {
    price: product.price || 0,
    productId: product.id,
    productName: product.name,
    productSku: product.sku,
    quantity,
    subtotal: (product.price || 0) * quantity,
  };
}

export function getOrdersByStatus(status: OrderStatus): TestOrder[] {
  return Object.values(TEST_ORDERS).filter((order) => order.status === status);
}

export function getOrdersByUser(userId: string): TestOrder[] {
  return Object.values(TEST_ORDERS).filter((order) => order.userId === userId);
}

export function calculateOrderTotals(items: TestOrderItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.09;
  const shipping = subtotal > 100 ? 0 : 15.0;
  const total = subtotal + tax + shipping;

  return { shipping, subtotal, tax, total };
}
