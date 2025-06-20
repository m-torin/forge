import { z } from 'zod';
import type { Prisma } from '../../client';

export const BrandCountOutputTypeSelectSchema: z.ZodType<Prisma.BrandCountOutputTypeSelect> = z.object({
  children: z.boolean().optional(),
  products: z.boolean().optional(),
  collections: z.boolean().optional(),
  media: z.boolean().optional(),
  jrFindReplaceRejects: z.boolean().optional(),
  identifiers: z.boolean().optional(),
  manufacturedProducts: z.boolean().optional(),
}).strict();

export default BrandCountOutputTypeSelectSchema;
