import type { Prisma } from '../../client';

import { z } from 'zod';

export const FavoriteJoinCreateManyCollectionInputSchema: z.ZodType<Prisma.FavoriteJoinCreateManyCollectionInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      userId: z.string(),
      productId: z.string().optional().nullable(),
    })
    .strict();

export default FavoriteJoinCreateManyCollectionInputSchema;
