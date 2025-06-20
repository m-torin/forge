import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ContentStatusSchema } from './ContentStatusSchema';

export const ArticleCreateManyDeletedByInputSchema: z.ZodType<Prisma.ArticleCreateManyDeletedByInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  title: z.string(),
  slug: z.string(),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  status: z.lazy(() => ContentStatusSchema).optional(),
  userId: z.string().optional().nullable()
}).strict();

export default ArticleCreateManyDeletedByInputSchema;
