import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';
import { FavoriteJoinUpdateWithoutUserInputSchema } from './FavoriteJoinUpdateWithoutUserInputSchema';
import { FavoriteJoinUncheckedUpdateWithoutUserInputSchema } from './FavoriteJoinUncheckedUpdateWithoutUserInputSchema';
import { FavoriteJoinCreateWithoutUserInputSchema } from './FavoriteJoinCreateWithoutUserInputSchema';
import { FavoriteJoinUncheckedCreateWithoutUserInputSchema } from './FavoriteJoinUncheckedCreateWithoutUserInputSchema';

export const FavoriteJoinUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.FavoriteJoinUpsertWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => FavoriteJoinWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => FavoriteJoinUpdateWithoutUserInputSchema),
        z.lazy(() => FavoriteJoinUncheckedUpdateWithoutUserInputSchema),
      ]),
      create: z.union([
        z.lazy(() => FavoriteJoinCreateWithoutUserInputSchema),
        z.lazy(() => FavoriteJoinUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default FavoriteJoinUpsertWithWhereUniqueWithoutUserInputSchema;
