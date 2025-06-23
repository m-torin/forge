import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyTypeSchema } from './TaxonomyTypeSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const TaxonomyCreateManyDeletedByInputSchema: z.ZodType<Prisma.TaxonomyCreateManyDeletedByInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      name: z.string(),
      slug: z.string(),
      type: z.lazy(() => TaxonomyTypeSchema).optional(),
      status: z.lazy(() => ContentStatusSchema).optional(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
      parentId: z.string().optional().nullable(),
      displayOrder: z.number().int().optional(),
      level: z.number().int().optional(),
      path: z.string().optional().nullable(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      deletedAt: z.coerce.date().optional().nullable(),
    })
    .strict();

export default TaxonomyCreateManyDeletedByInputSchema;
