import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';
import { FavoriteJoinUpdateWithoutCollectionInputSchema } from './FavoriteJoinUpdateWithoutCollectionInputSchema';
import { FavoriteJoinUncheckedUpdateWithoutCollectionInputSchema } from './FavoriteJoinUncheckedUpdateWithoutCollectionInputSchema';
import { FavoriteJoinCreateWithoutCollectionInputSchema } from './FavoriteJoinCreateWithoutCollectionInputSchema';
import { FavoriteJoinUncheckedCreateWithoutCollectionInputSchema } from './FavoriteJoinUncheckedCreateWithoutCollectionInputSchema';

export const FavoriteJoinUpsertWithWhereUniqueWithoutCollectionInputSchema: z.ZodType<Prisma.FavoriteJoinUpsertWithWhereUniqueWithoutCollectionInput> = z.object({
  where: z.lazy(() => FavoriteJoinWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FavoriteJoinUpdateWithoutCollectionInputSchema),z.lazy(() => FavoriteJoinUncheckedUpdateWithoutCollectionInputSchema) ]),
  create: z.union([ z.lazy(() => FavoriteJoinCreateWithoutCollectionInputSchema),z.lazy(() => FavoriteJoinUncheckedCreateWithoutCollectionInputSchema) ]),
}).strict();

export default FavoriteJoinUpsertWithWhereUniqueWithoutCollectionInputSchema;
