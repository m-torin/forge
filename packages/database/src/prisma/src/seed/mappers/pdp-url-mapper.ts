import { type Prisma } from '../../../../../prisma-generated/client';

export interface PdpUrlConfig {
  pdpJoinId: string;
  productSlug: string;
  retailerSlug: string;
  baseUrl: string;
}

export function generatePdpUrls(config: PdpUrlConfig): Prisma.PdpUrlCreateManyInput[] {
  const urls: Prisma.PdpUrlCreateManyInput[] = [];

  // Generate canonical URL
  const canonicalUrl = generateRetailerUrl(config);
  urls.push({
    pdpJoinId: config.pdpJoinId,
    name: `Canonical URL for ${config.productSlug}`,
    url: canonicalUrl,
    urlType: 'CANONICAL',
    copy: {
      generated: true,
      retailer: config.retailerSlug,
    },
  });

  // Generate mobile URL
  const mobileUrl = generateMobileUrl(config);
  if (mobileUrl !== canonicalUrl) {
    urls.push({
      pdpJoinId: config.pdpJoinId,
      name: `Mobile URL for ${config.productSlug}`,
      url: mobileUrl,
      urlType: 'ALTERNATE',
      copy: {
        generated: true,
        platform: 'mobile',
        retailer: config.retailerSlug,
      },
    });
  }

  // Generate app deep link for major retailers
  if (['target', 'walmart', 'amazon'].includes(config.retailerSlug)) {
    const appUrl = generateAppDeepLink(config);
    urls.push({
      pdpJoinId: config.pdpJoinId,
      name: `App URL for ${config.productSlug}`,
      url: appUrl,
      urlType: 'ALTERNATE',
      copy: {
        generated: true,
        platform: 'app',
        retailer: config.retailerSlug,
      },
    });
  }

  // Generate AMP URL for some retailers
  if (['target', 'walmart'].includes(config.retailerSlug) && Math.random() > 0.5) {
    urls.push({
      pdpJoinId: config.pdpJoinId,
      name: `AMP URL for ${config.productSlug}`,
      url: `${canonicalUrl}?amp=true`,
      urlType: 'ALTERNATE',
      copy: {
        generated: true,
        platform: 'amp',
        retailer: config.retailerSlug,
      },
    });
  }

  return urls;
}

function generateRetailerUrl(config: PdpUrlConfig): string {
  const { baseUrl, productSlug, retailerSlug } = config;

  // Generate retailer-specific URL patterns
  const urlPatterns: Record<string, (slug: string) => string> = {
    target: slug => `/p/${slug}/-/A-${generateTargetDPCI()}`,
    walmart: slug => `/ip/${slug}/${generateWalmartId()}`,
    amazon: _slug => `/dp/${generateAmazonASIN()}`,
    anthropologie: slug => `/shop/${slug}`,
    'urban-outfitters': slug => `/shop/${slug}`,
    'free-people': slug => `/shop/${slug}`,
    revolve: slug => `/p/${slug}/dp/${generateRevolveId()}`,
    'net-a-porter': slug => `/en-us/shop/product/${slug}/${generateNetAPorterId()}`,
  };

  const pattern = urlPatterns[retailerSlug];
  if (pattern) {
    return `${baseUrl}${pattern(productSlug)}`;
  }

  // Default pattern for other retailers
  return `${baseUrl}/products/${productSlug}`;
}

function generateMobileUrl(config: PdpUrlConfig): string {
  const { baseUrl, retailerSlug } = config;

  // Some retailers have different mobile URLs
  if (retailerSlug === 'amazon') {
    return baseUrl.replace('www.', 'm.');
  }

  if (retailerSlug === 'target') {
    return baseUrl.replace('www.', 'm.');
  }

  // Most modern retailers use responsive design
  return generateRetailerUrl(config);
}

function generateAppDeepLink(config: PdpUrlConfig): string {
  const deepLinkSchemes: Record<string, string> = {
    target: 'target://product/',
    walmart: 'walmart://product/',
    amazon: 'com.amazon.mobile.shopping://product/',
  };

  const scheme = deepLinkSchemes[config.retailerSlug] || '';

  if (config.retailerSlug === 'amazon') {
    return `${scheme}${generateAmazonASIN()}`;
  }

  return `${scheme}${config.productSlug}`;
}

// Generate retailer-specific IDs
function generateTargetDPCI(): string {
  // Target DPCI format: XXX-XX-XXXX
  const dept = Math.floor(Math.random() * 900 + 100); // 3 digits
  const cls = Math.floor(Math.random() * 90 + 10); // 2 digits
  const item = Math.floor(Math.random() * 9000 + 1000); // 4 digits
  return `${dept}${cls}${item}`;
}

function generateWalmartId(): string {
  // Walmart uses numeric IDs
  return Math.floor(Math.random() * 900000000 + 100000000).toString();
}

function generateAmazonASIN(): string {
  // Reuse ASIN generation logic
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let asin = 'B0';

  for (let i = 0; i < 8; i++) {
    asin += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return asin;
}

function generateRevolveId(): string {
  // Revolve uses alphanumeric codes
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const prefix = Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
  const suffix = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-WF${suffix}`;
}

function generateNetAPorterId(): string {
  // Net-a-Porter uses numeric IDs
  return Math.floor(Math.random() * 9000000 + 1000000).toString();
}
