import { BrandType, ContentStatus, type Prisma } from '../../../../../prisma-generated/client';

interface RetailerBrandConfig {
  name: string;
  slug: string;
  type: BrandType;
  baseUrl: string;
  description: string;
  mission: string;
  values: string[];
}

export function createBrandFromVendor(vendorName: string): Prisma.BrandCreateInput {
  const slug = vendorName.toLowerCase().replace(/\s+/g, '-');

  // All vendor names from webapp products are manufacturer brands (LABEL type)
  // Retailers like Target, Walmart, Amazon will be created separately
  const brandType = BrandType.LABEL;

  return {
    name: vendorName,
    slug,
    type: brandType,
    status: ContentStatus.PUBLISHED,
    copy: {
      description: `${vendorName} is a premium fashion brand offering high-quality products.`,
      mission: 'Creating timeless fashion that empowers and inspires.',
      values: ['Quality', 'Sustainability', 'Innovation', 'Style'],
    },
  };
}

export function createRetailerBrand(config: RetailerBrandConfig): Prisma.BrandCreateInput {
  return {
    name: config.name,
    slug: config.slug,
    type: config.type,
    status: ContentStatus.PUBLISHED,
    baseUrl: config.baseUrl,
    copy: {
      description: config.description,
      mission: config.mission,
      values: config.values,
    },
  };
}

export const RETAILER_BRANDS: RetailerBrandConfig[] = [
  {
    name: 'Target',
    slug: 'target',
    type: BrandType.RETAILER,
    baseUrl: 'https://www.target.com',
    description:
      'Target is a general merchandise retailer with stores in all 50 U.S. states and the District of Columbia.',
    mission: 'To help all families discover the joy of everyday life.',
    values: ['Inclusivity', 'Community', 'Sustainability', 'Innovation'],
  },
  {
    name: 'Walmart',
    slug: 'walmart',
    type: BrandType.RETAILER,
    baseUrl: 'https://www.walmart.com',
    description:
      'Walmart Inc. is an American multinational retail corporation that operates a chain of hypermarkets, discount department stores, and grocery stores.',
    mission: 'To save people money so they can live better.',
    values: ['Service', 'Excellence', 'Integrity', 'Respect'],
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    type: BrandType.MARKETPLACE,
    baseUrl: 'https://www.amazon.com',
    description:
      'Amazon is an American multinational technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence.',
    mission: "To be Earth's most customer-centric company.",
    values: ['Customer Obsession', 'Innovation', 'Operational Excellence', 'Long-term Thinking'],
  },
];
