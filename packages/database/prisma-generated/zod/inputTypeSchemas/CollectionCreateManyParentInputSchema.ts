import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionTypeSchema } from './CollectionTypeSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const CollectionCreateManyParentInputSchema: z.ZodType<Prisma.CollectionCreateManyParentInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  type: z.lazy(() => CollectionTypeSchema).optional(),
  status: z.lazy(() => ContentStatusSchema).optional(),
  userId: z.string().optional().nullable(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable()
}).strict();

export default CollectionCreateManyParentInputSchema;
