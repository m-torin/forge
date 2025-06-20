import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereInputSchema } from './SeriesWhereInputSchema';
import { SeriesUpdateWithoutStoriesInputSchema } from './SeriesUpdateWithoutStoriesInputSchema';
import { SeriesUncheckedUpdateWithoutStoriesInputSchema } from './SeriesUncheckedUpdateWithoutStoriesInputSchema';

export const SeriesUpdateToOneWithWhereWithoutStoriesInputSchema: z.ZodType<Prisma.SeriesUpdateToOneWithWhereWithoutStoriesInput> = z.object({
  where: z.lazy(() => SeriesWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => SeriesUpdateWithoutStoriesInputSchema),z.lazy(() => SeriesUncheckedUpdateWithoutStoriesInputSchema) ]),
}).strict();

export default SeriesUpdateToOneWithWhereWithoutStoriesInputSchema;
