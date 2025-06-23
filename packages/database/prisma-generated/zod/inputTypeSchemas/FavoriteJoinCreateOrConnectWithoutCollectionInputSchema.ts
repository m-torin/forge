import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';
import { FavoriteJoinCreateWithoutCollectionInputSchema } from './FavoriteJoinCreateWithoutCollectionInputSchema';
import { FavoriteJoinUncheckedCreateWithoutCollectionInputSchema } from './FavoriteJoinUncheckedCreateWithoutCollectionInputSchema';

export const FavoriteJoinCreateOrConnectWithoutCollectionInputSchema: z.ZodType<Prisma.FavoriteJoinCreateOrConnectWithoutCollectionInput> =
  z
    .object({
      where: z.lazy(() => FavoriteJoinWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => FavoriteJoinCreateWithoutCollectionInputSchema),
        z.lazy(() => FavoriteJoinUncheckedCreateWithoutCollectionInputSchema),
      ]),
    })
    .strict();

export default FavoriteJoinCreateOrConnectWithoutCollectionInputSchema;
