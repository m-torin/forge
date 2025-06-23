import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';
import { FavoriteJoinUpdateWithoutUserInputSchema } from './FavoriteJoinUpdateWithoutUserInputSchema';
import { FavoriteJoinUncheckedUpdateWithoutUserInputSchema } from './FavoriteJoinUncheckedUpdateWithoutUserInputSchema';

export const FavoriteJoinUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.FavoriteJoinUpdateWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => FavoriteJoinWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => FavoriteJoinUpdateWithoutUserInputSchema),
        z.lazy(() => FavoriteJoinUncheckedUpdateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default FavoriteJoinUpdateWithWhereUniqueWithoutUserInputSchema;
