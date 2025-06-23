import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereInputSchema } from './FandomWhereInputSchema';
import { FandomUpdateWithoutStoriesInputSchema } from './FandomUpdateWithoutStoriesInputSchema';
import { FandomUncheckedUpdateWithoutStoriesInputSchema } from './FandomUncheckedUpdateWithoutStoriesInputSchema';

export const FandomUpdateToOneWithWhereWithoutStoriesInputSchema: z.ZodType<Prisma.FandomUpdateToOneWithWhereWithoutStoriesInput> =
  z
    .object({
      where: z.lazy(() => FandomWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => FandomUpdateWithoutStoriesInputSchema),
        z.lazy(() => FandomUncheckedUpdateWithoutStoriesInputSchema),
      ]),
    })
    .strict();

export default FandomUpdateToOneWithWhereWithoutStoriesInputSchema;
