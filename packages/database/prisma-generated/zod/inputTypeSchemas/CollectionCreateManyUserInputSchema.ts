import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionTypeSchema } from './CollectionTypeSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const CollectionCreateManyUserInputSchema: z.ZodType<Prisma.CollectionCreateManyUserInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      name: z.string(),
      slug: z.string(),
      type: z.lazy(() => CollectionTypeSchema).optional(),
      status: z.lazy(() => ContentStatusSchema).optional(),
      copy: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
      parentId: z.string().optional().nullable(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      deletedAt: z.coerce.date().optional().nullable(),
      deletedById: z.string().optional().nullable(),
    })
    .strict();

export default CollectionCreateManyUserInputSchema;
