import type { Prisma } from '../../client';

import { z } from 'zod';

export const FavoriteJoinUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.FavoriteJoinUncheckedCreateWithoutProductInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      userId: z.string(),
      collectionId: z.string().optional().nullable(),
    })
    .strict();

export default FavoriteJoinUncheckedCreateWithoutProductInputSchema;
