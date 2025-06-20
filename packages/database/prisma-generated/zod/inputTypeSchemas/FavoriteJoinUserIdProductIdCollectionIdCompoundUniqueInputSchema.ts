import type { Prisma } from '../../client';

import { z } from 'zod';

export const FavoriteJoinUserIdProductIdCollectionIdCompoundUniqueInputSchema: z.ZodType<Prisma.FavoriteJoinUserIdProductIdCollectionIdCompoundUniqueInput> = z.object({
  userId: z.string(),
  productId: z.string(),
  collectionId: z.string()
}).strict();

export default FavoriteJoinUserIdProductIdCollectionIdCompoundUniqueInputSchema;
