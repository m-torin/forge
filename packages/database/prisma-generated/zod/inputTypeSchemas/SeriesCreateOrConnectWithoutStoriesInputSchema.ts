import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesCreateWithoutStoriesInputSchema } from './SeriesCreateWithoutStoriesInputSchema';
import { SeriesUncheckedCreateWithoutStoriesInputSchema } from './SeriesUncheckedCreateWithoutStoriesInputSchema';

export const SeriesCreateOrConnectWithoutStoriesInputSchema: z.ZodType<Prisma.SeriesCreateOrConnectWithoutStoriesInput> =
  z
    .object({
      where: z.lazy(() => SeriesWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => SeriesCreateWithoutStoriesInputSchema),
        z.lazy(() => SeriesUncheckedCreateWithoutStoriesInputSchema),
      ]),
    })
    .strict();

export default SeriesCreateOrConnectWithoutStoriesInputSchema;
