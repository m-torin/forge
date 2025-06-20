import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesUpdateWithoutStoriesInputSchema } from './SeriesUpdateWithoutStoriesInputSchema';
import { SeriesUncheckedUpdateWithoutStoriesInputSchema } from './SeriesUncheckedUpdateWithoutStoriesInputSchema';
import { SeriesCreateWithoutStoriesInputSchema } from './SeriesCreateWithoutStoriesInputSchema';
import { SeriesUncheckedCreateWithoutStoriesInputSchema } from './SeriesUncheckedCreateWithoutStoriesInputSchema';
import { SeriesWhereInputSchema } from './SeriesWhereInputSchema';

export const SeriesUpsertWithoutStoriesInputSchema: z.ZodType<Prisma.SeriesUpsertWithoutStoriesInput> = z.object({
  update: z.union([ z.lazy(() => SeriesUpdateWithoutStoriesInputSchema),z.lazy(() => SeriesUncheckedUpdateWithoutStoriesInputSchema) ]),
  create: z.union([ z.lazy(() => SeriesCreateWithoutStoriesInputSchema),z.lazy(() => SeriesUncheckedCreateWithoutStoriesInputSchema) ]),
  where: z.lazy(() => SeriesWhereInputSchema).optional()
}).strict();

export default SeriesUpsertWithoutStoriesInputSchema;
