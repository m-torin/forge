import type { Prisma } from '../../client';

import { z } from 'zod';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const ProductCategoryCreateManyParentInputSchema: z.ZodType<Prisma.ProductCategoryCreateManyParentInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  status: z.lazy(() => ContentStatusSchema).optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  displayOrder: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable()
}).strict();

export default ProductCategoryCreateManyParentInputSchema;
