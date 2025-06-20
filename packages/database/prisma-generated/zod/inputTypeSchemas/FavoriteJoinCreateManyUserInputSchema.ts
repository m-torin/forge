import type { Prisma } from '../../client';

import { z } from 'zod';

export const FavoriteJoinCreateManyUserInputSchema: z.ZodType<Prisma.FavoriteJoinCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  productId: z.string().optional().nullable(),
  collectionId: z.string().optional().nullable()
}).strict();

export default FavoriteJoinCreateManyUserInputSchema;
