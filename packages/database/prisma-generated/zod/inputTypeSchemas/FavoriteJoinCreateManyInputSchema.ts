import type { Prisma } from '../../client';

import { z } from 'zod';

export const FavoriteJoinCreateManyInputSchema: z.ZodType<Prisma.FavoriteJoinCreateManyInput> = z
  .object({
    id: z.string().cuid().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    userId: z.string(),
    productId: z.string().optional().nullable(),
    collectionId: z.string().optional().nullable(),
  })
  .strict();

export default FavoriteJoinCreateManyInputSchema;
