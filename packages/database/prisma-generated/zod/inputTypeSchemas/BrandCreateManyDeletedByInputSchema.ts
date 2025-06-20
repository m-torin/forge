import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandTypeSchema } from './BrandTypeSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const BrandCreateManyDeletedByInputSchema: z.ZodType<Prisma.BrandCreateManyDeletedByInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  type: z.lazy(() => BrandTypeSchema).optional(),
  status: z.lazy(() => ContentStatusSchema).optional(),
  baseUrl: z.string().optional().nullable(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  parentId: z.string().optional().nullable(),
  displayOrder: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable()
}).strict();

export default BrandCreateManyDeletedByInputSchema;
