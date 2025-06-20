import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';
import { FavoriteJoinCreateWithoutProductInputSchema } from './FavoriteJoinCreateWithoutProductInputSchema';
import { FavoriteJoinUncheckedCreateWithoutProductInputSchema } from './FavoriteJoinUncheckedCreateWithoutProductInputSchema';

export const FavoriteJoinCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.FavoriteJoinCreateOrConnectWithoutProductInput> = z.object({
  where: z.lazy(() => FavoriteJoinWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FavoriteJoinCreateWithoutProductInputSchema),z.lazy(() => FavoriteJoinUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export default FavoriteJoinCreateOrConnectWithoutProductInputSchema;
