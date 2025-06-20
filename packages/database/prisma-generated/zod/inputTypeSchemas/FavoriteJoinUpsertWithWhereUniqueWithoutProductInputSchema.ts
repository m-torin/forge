import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';
import { FavoriteJoinUpdateWithoutProductInputSchema } from './FavoriteJoinUpdateWithoutProductInputSchema';
import { FavoriteJoinUncheckedUpdateWithoutProductInputSchema } from './FavoriteJoinUncheckedUpdateWithoutProductInputSchema';
import { FavoriteJoinCreateWithoutProductInputSchema } from './FavoriteJoinCreateWithoutProductInputSchema';
import { FavoriteJoinUncheckedCreateWithoutProductInputSchema } from './FavoriteJoinUncheckedCreateWithoutProductInputSchema';

export const FavoriteJoinUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.FavoriteJoinUpsertWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => FavoriteJoinWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FavoriteJoinUpdateWithoutProductInputSchema),z.lazy(() => FavoriteJoinUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => FavoriteJoinCreateWithoutProductInputSchema),z.lazy(() => FavoriteJoinUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export default FavoriteJoinUpsertWithWhereUniqueWithoutProductInputSchema;
