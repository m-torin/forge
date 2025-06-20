import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';
import { FavoriteJoinUpdateWithoutCollectionInputSchema } from './FavoriteJoinUpdateWithoutCollectionInputSchema';
import { FavoriteJoinUncheckedUpdateWithoutCollectionInputSchema } from './FavoriteJoinUncheckedUpdateWithoutCollectionInputSchema';

export const FavoriteJoinUpdateWithWhereUniqueWithoutCollectionInputSchema: z.ZodType<Prisma.FavoriteJoinUpdateWithWhereUniqueWithoutCollectionInput> = z.object({
  where: z.lazy(() => FavoriteJoinWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FavoriteJoinUpdateWithoutCollectionInputSchema),z.lazy(() => FavoriteJoinUncheckedUpdateWithoutCollectionInputSchema) ]),
}).strict();

export default FavoriteJoinUpdateWithWhereUniqueWithoutCollectionInputSchema;
