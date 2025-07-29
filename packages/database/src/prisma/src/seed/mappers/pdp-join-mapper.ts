import { type Prisma } from '../../../../../prisma-generated/client';

interface PdpJoinConfig {
  productId: string;
  brandId: string;
  productSlug: string;
  retailerSlug: string;
  baseUrl: string;
}

// Generate realistic product URLs for each retailer
function generateRetailerUrl(retailerSlug: string, productSlug: string, baseUrl: string): string {
  const urlPatterns: Record<string, (slug: string) => string> = {
    target: slug => `/p/${slug}/-/A-${Math.floor(Math.random() * 90000000) + 10000000}`,
    walmart: slug => `/ip/${slug}/${Math.floor(Math.random() * 900000000) + 100000000}`,
    amazon: _slug => `/dp/B0${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
  };

  const pattern = urlPatterns[retailerSlug] || (slug => `/products/${slug}`);
  return `${baseUrl}${pattern(productSlug)}`;
}

export function createPdpJoin(config: PdpJoinConfig): Prisma.PdpJoinCreateInput {
  const canonicalUrl = generateRetailerUrl(config.retailerSlug, config.productSlug, config.baseUrl);

  return {
    product: { connect: { id: config.productId } },
    brand: { connect: { id: config.brandId } },
    canonicalUrl,
    copy: {
      retailerSpecificInfo: `Product available at ${config.retailerSlug}`,
      lastUpdated: new Date().toISOString(),
    },
  };
}

// Distribution strategy for products across retailers
export interface ProductRetailerDistribution {
  productSlug: string;
  retailers: string[]; // retailer slugs
}

// Realistic distribution - not all products are at all retailers
export function generateProductRetailerDistribution(
  productSlugs: string[],
): ProductRetailerDistribution[] {
  const allRetailers = ['target', 'walmart', 'amazon'];

  return productSlugs.map((productSlug, index) => {
    // Different distribution patterns
    if (index % 5 === 0) {
      // 20% of products are exclusive to one retailer
      const exclusiveRetailer = allRetailers[index % 3];
      return { productSlug, retailers: [exclusiveRetailer] };
    } else if (index % 3 === 0) {
      // 33% are at two retailers
      const retailers = index % 2 === 0 ? ['target', 'amazon'] : ['walmart', 'amazon'];
      return { productSlug, retailers };
    } else {
      // Rest are at all retailers
      return { productSlug, retailers: allRetailers };
    }
  });
}

// Some brands also sell directly
export function shouldIncludeBrandDirectSale(brandSlug: string): boolean {
  // Luxury and premium brands often sell directly
  const directSaleBrands = ['luxcouture', 'chicelegance', 'tailoredfit'];
  return directSaleBrands.includes(brandSlug);
}
