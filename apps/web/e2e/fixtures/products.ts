import type { ProductStatus } from "@prisma/client";

export interface TestProduct {
  aiGenerated?: boolean;
  attributes?: Record<string, any>;
  barcodes?: TestProductBarcode[];
  brand?: string;
  category: string;
  currency?: string;
  description?: string;
  id: string;
  images?: TestProductImage[];
  name: string;
  organizationId?: string;
  price?: number;
  sku: string;
  status: ProductStatus;
}

export interface TestProductImage {
  alt?: string;
  id: string;
  sortOrder?: number;
  url: string;
}

export interface TestProductBarcode {
  barcode: string;
  isPrimary?: boolean;
  type: string;
}

export const TEST_CATEGORIES = {
  BEAUTY: "beauty-personal-care",
  BOOKS: "books",
  CLOTHING: "clothing",
  ELECTRONICS: "electronics",
  FOOD: "food-beverage",
  HOME: "home-garden",
  SPORTS: "sports-outdoors",
  TOYS: "toys-games",
};

export const TEST_PRODUCTS: Record<string, TestProduct> = {
  book: {
    id: "test-product-003",
    name: "The Art of Programming",
    attributes: {
      author: "Jane Developer",
      format: "Hardcover",
      isbn: "978-3-16-148410-0",
      language: "English",
      pages: 450,
    },
    barcodes: [
      {
        type: "EAN_13",
        barcode: "9783161484100",
        isPrimary: true,
      },
    ],
    brand: "Tech Publications",
    category: TEST_CATEGORIES.BOOKS,
    currency: "USD",
    description: "A comprehensive guide to modern programming practices",
    images: [
      {
        id: "test-image-004",
        url: "/images/products/p3.jpg",
        alt: "Book Cover",
        sortOrder: 0,
      },
    ],
    organizationId: "test-org-001",
    price: 49.99,
    sku: "BOOK-PROG-001",
    status: "ACTIVE",
  },
  draft: {
    id: "test-product-005",
    name: "Upcoming Product",
    category: TEST_CATEGORIES.ELECTRONICS,
    currency: "USD",
    description: "This product is still in development",
    organizationId: "test-org-001",
    price: 0,
    sku: "DRAFT-001",
    status: "DRAFT",
  },
  laptop: {
    id: "test-product-001",
    name: 'MacBook Pro 16"',
    attributes: {
      color: "Space Gray",
      memory: "32GB",
      processor: "M3 Max",
      storage: "1TB",
    },
    barcodes: [
      {
        type: "UPC_A",
        barcode: "194253434567",
        isPrimary: true,
      },
    ],
    brand: "Apple",
    category: TEST_CATEGORIES.ELECTRONICS,
    currency: "USD",
    description: "Powerful laptop for professionals with M3 Max chip",
    images: [
      {
        id: "test-image-001",
        url: "/images/products/p1.jpg",
        alt: "MacBook Pro Front View",
        sortOrder: 0,
      },
      {
        id: "test-image-002",
        url: "/images/products/p1-1.jpg",
        alt: "MacBook Pro Side View",
        sortOrder: 1,
      },
    ],
    organizationId: "test-org-001",
    price: 2499.99,
    sku: "MBP16-2023-001",
    status: "ACTIVE",
  },
  onSale: {
    id: "test-product-006",
    name: "Summer Beach Ball",
    attributes: {
      discount: 33,
      material: "PVC",
      originalPrice: 14.99,
      size: "24 inches",
    },
    brand: "BeachFun",
    category: TEST_CATEGORIES.TOYS,
    currency: "USD",
    description: "Colorful inflatable beach ball for summer fun",
    images: [
      {
        id: "test-image-005",
        url: "/images/products/p4.jpg",
        alt: "Beach Ball",
        sortOrder: 0,
      },
    ],
    organizationId: "test-org-001",
    price: 9.99,
    sku: "TOY-BEACH-001",
    status: "ACTIVE",
  },
  outOfStock: {
    id: "test-product-004",
    name: "Limited Edition Sneakers",
    attributes: {
      color: "Red/White",
      limited: true,
      size: "10",
      stock: 0,
      style: "High-top",
    },
    brand: "SneakerCo",
    category: TEST_CATEGORIES.CLOTHING,
    currency: "USD",
    description: "Exclusive limited edition sneakers",
    organizationId: "test-org-001",
    price: 199.99,
    sku: "SNK-LTD-001",
    status: "ACTIVE",
  },
  tshirt: {
    id: "test-product-002",
    name: "Classic Cotton T-Shirt",
    attributes: {
      color: "Black",
      fit: "Regular",
      material: "100% Cotton",
      size: "Medium",
    },
    barcodes: [
      {
        type: "UPC_A",
        barcode: "850000123456",
        isPrimary: true,
      },
    ],
    brand: "ComfortWear",
    category: TEST_CATEGORIES.CLOTHING,
    currency: "USD",
    description: "Comfortable 100% cotton t-shirt perfect for everyday wear",
    images: [
      {
        id: "test-image-003",
        url: "/images/products/p2.jpg",
        alt: "Black T-Shirt Front",
        sortOrder: 0,
      },
    ],
    organizationId: "test-org-001",
    price: 29.99,
    sku: "TSH-CTN-BLK-M",
    status: "ACTIVE",
  },
};

export function createTestProduct(
  overrides?: Partial<TestProduct>,
): TestProduct {
  const id = overrides?.id || `test-product-${Date.now()}`;
  const sku = overrides?.sku || `SKU-${Date.now()}`;

  return {
    id,
    name: "Test Product",
    attributes: {},
    brand: "TestBrand",
    category: TEST_CATEGORIES.ELECTRONICS,
    currency: "USD",
    description: "A test product for e2e testing",
    price: 99.99,
    sku,
    status: "ACTIVE",
    ...overrides,
  };
}

export function createProductSet(
  count: number,
  category?: string,
): TestProduct[] {
  const products: TestProduct[] = [];
  const categories = Object.values(TEST_CATEGORIES);

  for (let i = 0; i < count; i++) {
    products.push(
      createTestProduct({
        id: `test-product-set-${i}`,
        name: `Product ${i + 1}`,
        attributes: {
          batch: "test-set",
          index: i,
        },
        category: category || categories[i % categories.length],
        price: Math.floor(Math.random() * 500) + 10,
        sku: `SKU-SET-${i}`,
      }),
    );
  }

  return products;
}

export function getProductsByCategory(category: string): TestProduct[] {
  return Object.values(TEST_PRODUCTS).filter(
    (product) => product.category === category,
  );
}

export function getActiveProducts(): TestProduct[] {
  return Object.values(TEST_PRODUCTS).filter(
    (product) => product.status === "ACTIVE",
  );
}
