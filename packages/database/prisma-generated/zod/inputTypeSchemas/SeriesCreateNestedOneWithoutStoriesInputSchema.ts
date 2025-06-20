import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesCreateWithoutStoriesInputSchema } from './SeriesCreateWithoutStoriesInputSchema';
import { SeriesUncheckedCreateWithoutStoriesInputSchema } from './SeriesUncheckedCreateWithoutStoriesInputSchema';
import { SeriesCreateOrConnectWithoutStoriesInputSchema } from './SeriesCreateOrConnectWithoutStoriesInputSchema';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';

export const SeriesCreateNestedOneWithoutStoriesInputSchema: z.ZodType<Prisma.SeriesCreateNestedOneWithoutStoriesInput> = z.object({
  create: z.union([ z.lazy(() => SeriesCreateWithoutStoriesInputSchema),z.lazy(() => SeriesUncheckedCreateWithoutStoriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => SeriesCreateOrConnectWithoutStoriesInputSchema).optional(),
  connect: z.lazy(() => SeriesWhereUniqueInputSchema).optional()
}).strict();

export default SeriesCreateNestedOneWithoutStoriesInputSchema;
