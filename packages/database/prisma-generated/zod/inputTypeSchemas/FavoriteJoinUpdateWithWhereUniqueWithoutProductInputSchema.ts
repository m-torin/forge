import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';
import { FavoriteJoinUpdateWithoutProductInputSchema } from './FavoriteJoinUpdateWithoutProductInputSchema';
import { FavoriteJoinUncheckedUpdateWithoutProductInputSchema } from './FavoriteJoinUncheckedUpdateWithoutProductInputSchema';

export const FavoriteJoinUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.FavoriteJoinUpdateWithWhereUniqueWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => FavoriteJoinWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => FavoriteJoinUpdateWithoutProductInputSchema),
        z.lazy(() => FavoriteJoinUncheckedUpdateWithoutProductInputSchema),
      ]),
    })
    .strict();

export default FavoriteJoinUpdateWithWhereUniqueWithoutProductInputSchema;
