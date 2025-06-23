import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';
import { FavoriteJoinCreateWithoutUserInputSchema } from './FavoriteJoinCreateWithoutUserInputSchema';
import { FavoriteJoinUncheckedCreateWithoutUserInputSchema } from './FavoriteJoinUncheckedCreateWithoutUserInputSchema';

export const FavoriteJoinCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.FavoriteJoinCreateOrConnectWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => FavoriteJoinWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => FavoriteJoinCreateWithoutUserInputSchema),
        z.lazy(() => FavoriteJoinUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default FavoriteJoinCreateOrConnectWithoutUserInputSchema;
