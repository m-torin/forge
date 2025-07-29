import { ContentStatus, type Prisma, TaxonomyType } from '../../../../../prisma-generated/client';

// Product status taxonomies
export const statusTaxonomies: Prisma.TaxonomyCreateInput[] = [
  {
    name: 'New in',
    slug: 'new-in',
    type: TaxonomyType.TAG,
    status: ContentStatus.PUBLISHED,
    copy: {
      description: 'Newly arrived products',
    },
  },
  {
    name: 'Best Seller',
    slug: 'best-seller',
    type: TaxonomyType.TAG,
    status: ContentStatus.PUBLISHED,
    copy: {
      description: 'Our most popular products',
    },
  },
  {
    name: 'Limited Edition',
    slug: 'limited-edition',
    type: TaxonomyType.TAG,
    status: ContentStatus.PUBLISHED,
    copy: {
      description: 'Exclusive limited edition items',
    },
  },
  {
    name: 'Trending',
    slug: 'trending',
    type: TaxonomyType.TAG,
    status: ContentStatus.PUBLISHED,
    copy: {
      description: 'Currently trending products',
    },
  },
];

// Color taxonomies from webapp products
export const colorTaxonomies: Prisma.TaxonomyCreateInput[] = [
  {
    name: 'Black',
    slug: 'black',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: '#000000',
      description: 'Classic black color',
    },
  },
  {
    name: 'Pink Yarrow',
    slug: 'pink-yarrow',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: 'oklch(42.1% 0.095 57.708)',
      description: 'Vibrant pink yarrow',
    },
  },
  {
    name: 'Indigo',
    slug: 'indigo',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: '#D1C9C1',
      description: 'Deep indigo blue',
    },
  },
  {
    name: 'Stone',
    slug: 'stone',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: '#f7e3d4',
      description: 'Natural stone color',
    },
  },
  {
    name: 'Emerald Green',
    slug: 'emerald-green',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: '#2E8B57',
      description: 'Rich emerald green',
    },
  },
  {
    name: 'Midnight Blue',
    slug: 'midnight-blue',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: '#191970',
      description: 'Deep midnight blue',
    },
  },
  {
    name: 'Ivory',
    slug: 'ivory',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: '#FFFFF0',
      description: 'Soft ivory white',
    },
  },
  {
    name: 'Blue',
    slug: 'blue',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: '#0000FF',
      description: 'Classic blue',
    },
  },
  {
    name: 'White',
    slug: 'white',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: '#FFFFFF',
      description: 'Pure white',
    },
  },
  {
    name: 'Gray',
    slug: 'gray',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: '#808080',
      description: 'Neutral gray',
    },
  },
  {
    name: 'Cream',
    slug: 'cream',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: '#FFFDD0',
      description: 'Soft cream',
    },
  },
  {
    name: 'Navy',
    slug: 'navy',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: '#000080',
      description: 'Navy blue',
    },
  },
  {
    name: 'Coral',
    slug: 'coral',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: '#FF7F50',
      description: 'Coral pink',
    },
  },
  {
    name: 'Forest Green',
    slug: 'forest-green',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: '#228B22',
      description: 'Forest green',
    },
  },
  {
    name: 'Sky Blue',
    slug: 'sky-blue',
    type: TaxonomyType.COLOR,
    status: ContentStatus.PUBLISHED,
    copy: {
      hex: '#87CEEB',
      description: 'Sky blue',
    },
  },
];

// Size taxonomies
export const sizeTaxonomies: Prisma.TaxonomyCreateInput[] = [
  {
    name: 'XXS',
    slug: 'xxs',
    type: TaxonomyType.SIZE,
    status: ContentStatus.PUBLISHED,
    copy: {
      description: 'Extra extra small',
      order: 1,
    },
  },
  {
    name: 'XS',
    slug: 'xs',
    type: TaxonomyType.SIZE,
    status: ContentStatus.PUBLISHED,
    copy: {
      description: 'Extra small',
      order: 2,
    },
  },
  {
    name: 'S',
    slug: 's',
    type: TaxonomyType.SIZE,
    status: ContentStatus.PUBLISHED,
    copy: {
      description: 'Small',
      order: 3,
    },
  },
  {
    name: 'M',
    slug: 'm',
    type: TaxonomyType.SIZE,
    status: ContentStatus.PUBLISHED,
    copy: {
      description: 'Medium',
      order: 4,
    },
  },
  {
    name: 'L',
    slug: 'l',
    type: TaxonomyType.SIZE,
    status: ContentStatus.PUBLISHED,
    copy: {
      description: 'Large',
      order: 5,
    },
  },
  {
    name: 'XL',
    slug: 'xl',
    type: TaxonomyType.SIZE,
    status: ContentStatus.PUBLISHED,
    copy: {
      description: 'Extra large',
      order: 6,
    },
  },
];

// Map product status to taxonomy
export function getStatusTaxonomy(status: string): string | null {
  const statusMap: Record<string, string> = {
    'New in': 'new-in',
    'Best Seller': 'best-seller',
    'Limited Edition': 'limited-edition',
    Trending: 'trending',
  };
  return statusMap[status] || null;
}

// Get all taxonomies to seed
export function getAllTaxonomies(): Prisma.TaxonomyCreateInput[] {
  return [...statusTaxonomies, ...colorTaxonomies, ...sizeTaxonomies];
}
