import { z } from 'zod';
import type { Prisma } from '../../client';

export const CollectionCountOutputTypeSelectSchema: z.ZodType<Prisma.CollectionCountOutputTypeSelect> = z.object({
  children: z.boolean().optional(),
  products: z.boolean().optional(),
  brands: z.boolean().optional(),
  taxonomies: z.boolean().optional(),
  categories: z.boolean().optional(),
  pdpJoins: z.boolean().optional(),
  media: z.boolean().optional(),
  favorites: z.boolean().optional(),
  registries: z.boolean().optional(),
  identifiers: z.boolean().optional(),
}).strict();

export default CollectionCountOutputTypeSelectSchema;
