import {
  MediaType,
  type Prisma,
  ProductStatus,
  ProductType,
} from '../../../../../prisma-generated/client';

interface WebappProduct {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  price: number;
  description: string;
  features: string[];
  careInstruction: string;
  shippingAndReturn: string;
  reviewNumber: number;
  rating: number;
  status: string;
  options: Array<{
    name: string;
    optionValues: Array<{
      name: string;
      swatch?: { color: string };
    }>;
  }>;
  images: Array<{
    src: string;
    alt: string;
  }>;
}

export function mapWebappProductToPrisma(product: WebappProduct): Prisma.ProductCreateInput {
  // Map status strings to ProductStatus enum
  const statusMap: Record<string, ProductStatus> = {
    'New in': ProductStatus.ACTIVE,
    'Best Seller': ProductStatus.ACTIVE,
    'Limited Edition': ProductStatus.ACTIVE,
    Trending: ProductStatus.ACTIVE,
  };

  // Generate physical properties based on product type
  const physicalProperties = {
    weight: Math.floor(Math.random() * 2000) + 200, // 200g to 2.2kg
    dimensions: {
      length: Math.floor(Math.random() * 40) + 20, // 20-60cm
      width: Math.floor(Math.random() * 30) + 15, // 15-45cm
      height: Math.floor(Math.random() * 10) + 2, // 2-12cm
    },
    materials: ['Cotton', 'Polyester', 'Silk', 'Wool', 'Denim'][Math.floor(Math.random() * 5)],
    care: ['Machine wash cold', 'Hand wash only', 'Dry clean only'][Math.floor(Math.random() * 3)],
  };

  // Generate compare at price (10-30% higher than current price)
  const compareAtPrice = product.price * (1 + (Math.random() * 0.2 + 0.1));

  return {
    name: product.title,
    slug: product.handle,
    category: 'Clothing', // Default category, will be refined based on product type
    status: statusMap[product.status] || ProductStatus.ACTIVE,
    brand: product.vendor,
    price: product.price,
    compareAtPrice: parseFloat(compareAtPrice.toFixed(2)),
    currency: 'USD',
    type: ProductType.PHYSICAL,
    physicalProperties,
    copy: {
      description: product.description,
      features: product.features,
      careInstructions: product.careInstruction,
      shippingAndReturn: product.shippingAndReturn,
    },
    attributes: {
      reviewCount: product.reviewNumber,
      rating: product.rating,
      statusLabel: product.status,
      sku: `${product.handle.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    },
  };
}

export function extractProductVariants(
  product: WebappProduct,
  parentId: string,
): Prisma.ProductCreateInput[] {
  const variants: Prisma.ProductCreateInput[] = [];

  // Get color and size options
  const colorOptions = product.options.find(opt => opt.name === 'Color')?.optionValues || [];
  const sizeOptions = product.options.find(opt => opt.name === 'Size')?.optionValues || [];

  // Create a variant for each color/size combination
  let displayOrder = 0;
  for (const color of colorOptions) {
    for (const size of sizeOptions) {
      const colorSlug = color.name.toLowerCase().replace(/\s+/g, '-');
      const sizeSlug = size.name.toLowerCase();
      const sku = `${product.handle}-${colorSlug}-${sizeSlug}`.toUpperCase();

      variants.push({
        name: `${product.title} - ${color.name} - ${size.name}`,
        slug: `${product.handle}-${colorSlug}-${sizeSlug}`,
        category: 'Clothing',
        status: ProductStatus.ACTIVE,
        brand: product.vendor,
        type: ProductType.VARIANT,
        variantPrice: product.price,
        displayOrder: displayOrder++,
        isDefault: displayOrder === 1, // First variant is default
        parent: { connect: { id: parentId } },
        copy: {
          description: product.description,
        },
        attributes: {
          color: color.name,
          colorSwatch: color.swatch?.color,
          size: size.name,
          sku: sku,
        },
      });
    }
  }

  return variants;
}

export function extractProductMedia(
  product: WebappProduct,
  productId: string,
): Prisma.MediaCreateManyInput[] {
  return product.images.map((image, index) => {
    // Estimate dimensions based on product images (typical e-commerce sizes)
    const dimensions = [
      { width: 800, height: 1200 }, // Portrait
      { width: 1200, height: 1200 }, // Square
      { width: 1200, height: 800 }, // Landscape
    ];
    const selectedDimension = dimensions[index % dimensions.length];

    // Estimate file size based on dimensions (rough estimate for JPEG)
    const estimatedSize = Math.floor(
      (selectedDimension.width * selectedDimension.height * 0.3) / 1024,
    ); // KB to bytes

    return {
      url: image.src,
      altText: image.alt || product.title,
      type: MediaType.IMAGE,
      width: selectedDimension.width,
      height: selectedDimension.height,
      size: estimatedSize * 1024, // Convert to bytes
      mimeType: 'image/jpeg',
      sortOrder: index,
      productId,
      copy: {},
    };
  });
}
