import { faker } from '@faker-js/faker';
import { type Prisma, ProductStatus, ProductType } from '../../../../../prisma-generated/client';

// Fashion-specific product categories
const _fashionCategories = [
  'Dresses',
  'Tops',
  'Bottoms',
  'Outerwear',
  'Activewear',
  'Swimwear',
  'Lingerie',
  'Sleepwear',
  'Accessories',
  'Footwear',
];

// Fashion product adjectives
const productAdjectives = [
  'Classic',
  'Modern',
  'Vintage',
  'Luxury',
  'Premium',
  'Designer',
  'Elegant',
  'Casual',
  'Formal',
  'Trendy',
  'Chic',
  'Bohemian',
  'Minimalist',
  'Statement',
  'Essential',
];

// Fashion materials
const materials = [
  'Cotton',
  'Silk',
  'Linen',
  'Wool',
  'Cashmere',
  'Denim',
  'Leather',
  'Velvet',
  'Satin',
  'Chiffon',
  'Jersey',
  'Tweed',
  'Polyester',
  'Viscose',
  'Modal',
];

// Product types by category
const productTypesByCategory: Record<string, string[]> = {
  Dresses: ['Maxi Dress', 'Midi Dress', 'Mini Dress', 'Wrap Dress', 'Shift Dress', 'A-Line Dress'],
  Tops: ['T-Shirt', 'Blouse', 'Tank Top', 'Sweater', 'Cardigan', 'Hoodie', 'Crop Top'],
  Bottoms: ['Jeans', 'Trousers', 'Skirt', 'Shorts', 'Leggings', 'Joggers'],
  Outerwear: ['Jacket', 'Coat', 'Blazer', 'Parka', 'Trench Coat', 'Windbreaker'],
  Activewear: ['Sports Bra', 'Yoga Pants', 'Running Shorts', 'Tank Top', 'Track Jacket'],
  Swimwear: ['Bikini', 'One-Piece', 'Swim Trunks', 'Cover-Up', 'Rash Guard'],
  Accessories: ['Scarf', 'Belt', 'Hat', 'Gloves', 'Wallet', 'Watch', 'Sunglasses'],
  Footwear: ['Sneakers', 'Boots', 'Sandals', 'Heels', 'Flats', 'Loafers', 'Oxfords'],
};

// Colors for variants
const colors = [
  'Black',
  'White',
  'Navy',
  'Gray',
  'Brown',
  'Beige',
  'Red',
  'Blue',
  'Green',
  'Pink',
  'Purple',
  'Yellow',
  'Orange',
  'Teal',
  'Burgundy',
  'Olive',
  'Coral',
  'Mint',
];

// Sizes by category
const sizesByCategory: Record<string, string[]> = {
  default: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  footwear: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  accessories: ['One Size', 'S/M', 'M/L'],
};

export function generateProductName(category: string): string {
  const adjective = faker.helpers.arrayElement(productAdjectives);
  const material = faker.helpers.arrayElement(materials);
  const productType = faker.helpers.arrayElement(productTypesByCategory[category] || ['Item']);

  // Randomly decide whether to include material
  if (faker.datatype.boolean()) {
    return `${adjective} ${material} ${productType}`;
  }
  return `${adjective} ${productType}`;
}

export function generateProductSKU(handle: string): string {
  const prefix = handle.substring(0, 3).toUpperCase();
  const number = faker.number.int({ min: 1000, max: 9999 });
  return `${prefix}-${number}`;
}

export function generateProduct(
  category: string,
  brandId: string,
  existingSlugs: Set<string>,
): Prisma.ProductCreateInput {
  const name = generateProductName(category);
  let slug = faker.helpers.slugify(name).toLowerCase();

  // Ensure unique slug
  let counter = 1;
  while (existingSlugs.has(slug)) {
    slug = `${faker.helpers.slugify(name).toLowerCase()}-${counter}`;
    counter++;
  }
  existingSlugs.add(slug);

  const basePrice = faker.number.float({ min: 19.99, max: 499.99, multipleOf: 0.01 });

  return {
    name,
    slug,
    category,
    status: ProductStatus.ACTIVE,
    type: ProductType.PHYSICAL,
    price: basePrice,
    currency: 'USD',
    brand: brandId,
    copy: {
      description: faker.commerce.productDescription(),
      features: [
        faker.commerce.productAdjective() + ' design',
        faker.commerce.productMaterial() + ' construction',
        faker.helpers.arrayElement(['Machine washable', 'Hand wash only', 'Dry clean only']),
        faker.helpers.arrayElement(['Imported', 'Made in USA', 'Made in Italy', 'Made in France']),
      ],
      careInstructions: generateCareInstructions(),
      sizeGuide: 'Standard US sizing. Model is wearing size M.',
    },
    attributes: {
      material: faker.helpers.arrayElement(materials),
      season: faker.helpers.arrayElement(['Spring/Summer', 'Fall/Winter', 'All Season']),
      fit: faker.helpers.arrayElement(['Regular', 'Slim', 'Relaxed', 'Oversized']),
      occasion: faker.helpers.arrayElement(['Casual', 'Formal', 'Business', 'Sport', 'Evening']),
    },
  };
}

export function generateProductVariants(
  parentProduct: any,
  category: string,
): Prisma.ProductCreateInput[] {
  const variants: Prisma.ProductCreateInput[] = [];
  const sizes = getSizesForCategory(category);
  const variantColors = faker.helpers.arrayElements(colors, { min: 2, max: 4 });

  let displayOrder = 0;
  for (const color of variantColors) {
    for (const size of sizes) {
      const colorSlug = color.toLowerCase().replace(/\s+/g, '-');
      const sizeSlug = size.toLowerCase().replace(/\s+/g, '-');
      const _variantSku = `${parentProduct.sku}-${colorSlug}-${sizeSlug}`.toUpperCase();

      variants.push({
        name: `${parentProduct.name} - ${color} - ${size}`,
        slug: `${parentProduct.slug}-${colorSlug}-${sizeSlug}`,
        category: parentProduct.category,
        status: ProductStatus.ACTIVE,
        type: ProductType.VARIANT,
        variantPrice:
          parentProduct.price + faker.number.float({ min: -10, max: 20, multipleOf: 0.01 }),
        displayOrder: displayOrder++,
        isDefault: displayOrder === 1,
        parent: { connect: { id: parentProduct.id } },
        copy: {
          description: parentProduct.copy.description,
        },
        attributes: {
          ...parentProduct.attributes,
          color,
          size,
        },
      });
    }
  }

  return variants;
}

function getSizesForCategory(category: string): string[] {
  if (category === 'Footwear') {
    return faker.helpers.arrayElements(sizesByCategory.footwear, { min: 5, max: 8 });
  }
  if (category === 'Accessories') {
    return sizesByCategory.accessories;
  }
  return sizesByCategory.default;
}

function generateCareInstructions(): string {
  const instructions = [
    'Machine wash cold with like colors',
    'Do not bleach',
    'Tumble dry low',
    'Iron on low heat if needed',
    'Do not dry clean',
  ];

  return faker.helpers.arrayElements(instructions, { min: 3, max: 5 }).join('. ') + '.';
}

export function generateProductMedia(
  productId: string,
  productName: string,
): Prisma.MediaCreateManyInput[] {
  const mediaCount = faker.number.int({ min: 3, max: 5 });
  const media: Prisma.MediaCreateManyInput[] = [];

  for (let i = 0; i < mediaCount; i++) {
    media.push({
      url: faker.image.urlLoremFlickr({ category: 'fashion', width: 800, height: 1200 }),
      altText: `${productName} - View ${i + 1}`,
      type: 'IMAGE',
      sortOrder: i,
      productId,
      copy: {},
    });
  }

  return media;
}
