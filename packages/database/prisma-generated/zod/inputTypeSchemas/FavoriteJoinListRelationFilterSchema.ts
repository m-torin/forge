import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinWhereInputSchema } from './FavoriteJoinWhereInputSchema';

export const FavoriteJoinListRelationFilterSchema: z.ZodType<Prisma.FavoriteJoinListRelationFilter> =
  z
    .object({
      every: z.lazy(() => FavoriteJoinWhereInputSchema).optional(),
      some: z.lazy(() => FavoriteJoinWhereInputSchema).optional(),
      none: z.lazy(() => FavoriteJoinWhereInputSchema).optional(),
    })
    .strict();

export default FavoriteJoinListRelationFilterSchema;
