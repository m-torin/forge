import { faker } from '@faker-js/faker';

import { Prisma } from '../generated/client';

// Generic helper to generate random enum values
export function randomEnum<T extends object>(enumObj: T): T[keyof T] {
  const values = Object.values(enumObj);
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
}

// Generic helper to pick random items from an array
export function pickRandom<T>(array: T[], count = 1): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper to maybe return a value (with configurable probability)
export function maybe<T>(value: T, probability = 0.5): T | null {
  return Math.random() > 1 - probability ? value : null;
}

// Generic barcode generator
export function generateBarcodes(): Prisma.ProductBarcodeCreateNestedManyWithoutProductInput {
  return {
    create: [
      {
        type: Prisma.BarcodeType.UPC_A,
        barcode: faker.string.numeric(12),
        isPrimary: true,
      },
      {
        type: Prisma.BarcodeType.EAN_13,
        barcode: faker.string.numeric(13),
        isPrimary: false,
      },
    ],
  };
}

// Generic digital assets generator
export function generateDigitalAssets(
  productName: string,
): Prisma.ProductAssetCreateNestedManyWithoutProductInput {
  const assets: Prisma.ProductAssetCreateWithoutProductInput[] = [
    {
      filename: `${faker.string.alphanumeric(8)}.jpg`,
      type: Prisma.AssetType.IMAGE,
      url: faker.image.url(),
      alt: `${productName} primary image`,
      description: `Primary product image for ${productName}`,
      mimeType: 'image/jpeg',
      size: faker.number.int({ max: 5000000, min: 100000 }),
      sortOrder: 0,
    },
  ];

  // 50% chance of secondary image
  if (Math.random() > 0.5) {
    assets.push({
      filename: `${faker.string.alphanumeric(8)}.jpg`,
      type: Prisma.AssetType.IMAGE,
      url: faker.image.url(),
      alt: `${productName} secondary image`,
      description: `Secondary product image for ${productName}`,
      mimeType: 'image/jpeg',
      size: faker.number.int({ max: 5000000, min: 100000 }),
      sortOrder: 1,
    });
  }

  // 30% chance of document
  if (Math.random() > 0.7) {
    assets.push({
      filename: `${faker.string.alphanumeric(8)}.pdf`,
      type: randomEnum({
        CERTIFICATE: Prisma.AssetType.CERTIFICATE,
        DOCUMENT: Prisma.AssetType.DOCUMENT,
        MANUAL: Prisma.AssetType.MANUAL,
        SPECIFICATION: Prisma.AssetType.SPECIFICATION,
      }),
      url: faker.internet.url(),
      alt: `${productName} documentation`,
      description: `Documentation for ${productName}`,
      mimeType: 'application/pdf',
      size: faker.number.int({ max: 2000000, min: 50000 }),
      sortOrder: 2,
    });
  }

  return { create: assets };
}

// SEO metadata generator
export function generateSeoMetadata(
  name: string,
  type: 'product' | 'brand' | 'category' | 'collection' = 'product',
) {
  const descriptors = {
    brand: faker.company.catchPhrase,
    category: () => `Browse our ${name} collection`,
    collection: () => `Curated collection of ${name}`,
    product: faker.commerce.productDescription,
  };

  return {
    keywords: Array.from({ length: faker.number.int({ max: 8, min: 3 }) }, () =>
      faker.commerce.productAdjective(),
    ),
    metaDescription: descriptors[type](),
    metaTitle: name,
  };
}

// Display options generator
export function generateDisplayOptions() {
  return {
    featuredProducts: Math.random() > 0.5,
    itemsPerPage: faker.number.int({ max: 24, min: 8 }),
    layout: randomEnum({ GRID: 'GRID', LIST: 'LIST', MASONRY: 'MASONRY' }),
    showInFooter: Math.random() > 0.7,
    showInNavigation: Math.random() > 0.3,
    showInSitemap: true,
    sortOptions: ['newest', 'price-low-high', 'price-high-low', 'popular'],
  };
}

// Contact information generator
export function generateContactInfo() {
  return {
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    country: faker.location.country(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    state: faker.location.state(),
    zip: faker.location.zipCode(),
  };
}

// Social media links generator
export function generateSocialLinks(name: string) {
  const username = faker.internet.userName();
  return {
    facebook: `https://facebook.com/${username}`,
    instagram: `https://instagram.com/${username}`,
    linkedin: `https://linkedin.com/company/${faker.helpers.slugify(name).toLowerCase()}`,
    twitter: `https://twitter.com/${username}`,
    website: faker.internet.url(),
  };
}

// Price information generator
export function generatePricing() {
  const msrp = parseFloat(faker.commerce.price({ max: 1000, min: 10 }));
  const discount = faker.number.int({ max: 50, min: 5 });
  const salePrice = msrp * (1 - discount / 100);

  return {
    currency: randomEnum({ CAD: 'CAD', EUR: 'EUR', GBP: 'GBP', USD: 'USD' }),
    discount: `${discount}%`,
    msrp: msrp.toFixed(2),
    salePrice: salePrice.toFixed(2),
  };
}

// Specifications generator
export function generateSpecifications() {
  return {
    certifications: Array.from({ length: faker.number.int({ max: 3, min: 0 }) }, () =>
      randomEnum({ CE: 'CE', FCC: 'FCC', ISO9001: 'ISO 9001', ROHS: 'RoHS', UL: 'UL' }),
    ),
    color: faker.color.human(),
    dimensions: `${faker.number.int({ max: 100, min: 1 })}x${faker.number.int({ max: 100, min: 1 })}x${faker.number.int({ max: 100, min: 1 })} cm`,
    manufacturer: faker.company.name(),
    material: faker.commerce.productMaterial(),
    warranty: `${faker.number.int({ max: 5, min: 1 })} year${Math.random() > 0.5 ? 's' : ''}`,
    weight: `${faker.number.float({ max: 20, min: 0.1, precision: 0.01 })} kg`,
  };
}

// Content block generator for articles/blogs
export function generateContentBlocks() {
  const blocks = [];

  // Add paragraphs
  const paragraphCount = faker.number.int({ max: 8, min: 3 });
  for (let i = 0; i < paragraphCount; i++) {
    blocks.push({
      type: 'paragraph',
      content: faker.lorem.paragraph(),
      order: blocks.length,
    });

    // 30% chance to add an image after a paragraph
    if (Math.random() > 0.7) {
      blocks.push({
        type: 'image',
        url: faker.image.url(),
        alt: faker.lorem.words(3),
        caption: faker.lorem.sentence(),
        order: blocks.length,
      });
    }
  }

  // 40% chance to add a quote
  if (Math.random() > 0.6) {
    blocks.push({
      type: 'quote',
      author: faker.person.fullName(),
      content: faker.lorem.sentences(2),
      order: blocks.length,
    });
  }

  // 30% chance to add a list
  if (Math.random() > 0.7) {
    blocks.push({
      type: 'list',
      items: Array.from({ length: faker.number.int({ max: 7, min: 3 }) }, () =>
        faker.lorem.sentence(),
      ),
      order: blocks.length,
      ordered: Math.random() > 0.5,
    });
  }

  return blocks;
}

// User preferences generator (consolidated)
export function generateUserPreferences() {
  return {
    accessibility: {
      fontSize: randomEnum({ LARGE: 'large', MEDIUM: 'medium', SMALL: 'small' }),
      highContrast: Math.random() > 0.9,
      reduceMotion: Math.random() > 0.8,
    },
    display: {
      gridView: Math.random() > 0.5,
      defaultSort: randomEnum({
        NEWEST: 'NEWEST',
        POPULAR: 'POPULAR',
        PRICE_ASC: 'PRICE_ASC',
        PRICE_DESC: 'PRICE_DESC',
      }),
      productsPerPage: faker.number.int({ max: 48, min: 12 }),
      showOutOfStock: Math.random() > 0.7,
    },
    language: randomEnum({ DE: 'de', EN: 'en', ES: 'es', FR: 'fr' }),
    notifications: {
      email: Math.random() > 0.3,
      marketing: Math.random() > 0.6,
      orderUpdates: Math.random() > 0.2,
      priceAlerts: Math.random() > 0.4,
      push: Math.random() > 0.5,
      sms: Math.random() > 0.7,
    },
    privacy: {
      analytics: Math.random() > 0.3,
      marketingEmails: Math.random() > 0.6,
      personalizedAds: Math.random() > 0.7,
      shareData: Math.random() > 0.5,
    },
    theme: randomEnum({ DARK: 'DARK', LIGHT: 'LIGHT', SYSTEM: 'SYSTEM' }),
  };
}

// Suspension details generator
export function generateSuspensionDetails() {
  const suspendedAt = faker.date.past();
  const duration = faker.number.int({ max: 90, min: 1 });

  return {
    appealNotes: Math.random() > 0.5 ? faker.lorem.paragraph() : null,
    appealStatus: randomEnum({
      APPROVED: 'APPROVED',
      NONE: 'NONE',
      PENDING: 'PENDING',
      REJECTED: 'REJECTED',
    }),
    notes: faker.lorem.paragraph(),
    previousWarnings: Array.from({ length: faker.number.int({ max: 3, min: 0 }) }, () => ({
      date: faker.date.past().toISOString(),
      reason: faker.lorem.sentence(),
    })),
    reason: faker.lorem.sentence(),
    suspendedAt: suspendedAt.toISOString(),
    suspendedBy: faker.person.fullName(),
    suspendedByRole: randomEnum({ ADMIN: 'admin', MODERATOR: 'moderator', SYSTEM: 'system' }),
    suspendedUntil: new Date(suspendedAt.getTime() + duration * 24 * 60 * 60 * 1000).toISOString(),
    warningCount: faker.number.int({ max: 5, min: 1 }),
  };
}

// Batch create helper to handle large datasets efficiently
export async function batchCreate<T>(
  items: T[],
  batchSize: number,
  createFn: (batch: T[]) => Promise<any>,
  label = 'items',
) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(
      `  Creating ${label} batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}...`,
    );
    const batchResults = await createFn(batch);
    results.push(...(Array.isArray(batchResults) ? batchResults : [batchResults]));
  }
  return results;
}

// Progress logger
export function logProgress(current: number, total: number, label: string) {
  const percentage = Math.round((current / total) * 100);
  console.log(`  ${label}: ${current}/${total} (${percentage}%)`);
}

// Safe create helper that skips on unique constraint violations
export async function safeCreate<T>(
  createFn: () => Promise<T>,
  errorMessage?: string,
): Promise<T | null> {
  try {
    return await createFn();
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Prisma unique constraint violation
      if (errorMessage) {
        console.log(`  ⚠️  ${errorMessage}`);
      }
      return null;
    }
    throw error;
  }
}
