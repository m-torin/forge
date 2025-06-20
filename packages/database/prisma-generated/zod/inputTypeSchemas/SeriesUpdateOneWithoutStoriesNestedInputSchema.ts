import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesCreateWithoutStoriesInputSchema } from './SeriesCreateWithoutStoriesInputSchema';
import { SeriesUncheckedCreateWithoutStoriesInputSchema } from './SeriesUncheckedCreateWithoutStoriesInputSchema';
import { SeriesCreateOrConnectWithoutStoriesInputSchema } from './SeriesCreateOrConnectWithoutStoriesInputSchema';
import { SeriesUpsertWithoutStoriesInputSchema } from './SeriesUpsertWithoutStoriesInputSchema';
import { SeriesWhereInputSchema } from './SeriesWhereInputSchema';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesUpdateToOneWithWhereWithoutStoriesInputSchema } from './SeriesUpdateToOneWithWhereWithoutStoriesInputSchema';
import { SeriesUpdateWithoutStoriesInputSchema } from './SeriesUpdateWithoutStoriesInputSchema';
import { SeriesUncheckedUpdateWithoutStoriesInputSchema } from './SeriesUncheckedUpdateWithoutStoriesInputSchema';

export const SeriesUpdateOneWithoutStoriesNestedInputSchema: z.ZodType<Prisma.SeriesUpdateOneWithoutStoriesNestedInput> = z.object({
  create: z.union([ z.lazy(() => SeriesCreateWithoutStoriesInputSchema),z.lazy(() => SeriesUncheckedCreateWithoutStoriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => SeriesCreateOrConnectWithoutStoriesInputSchema).optional(),
  upsert: z.lazy(() => SeriesUpsertWithoutStoriesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => SeriesWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => SeriesWhereInputSchema) ]).optional(),
  connect: z.lazy(() => SeriesWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => SeriesUpdateToOneWithWhereWithoutStoriesInputSchema),z.lazy(() => SeriesUpdateWithoutStoriesInputSchema),z.lazy(() => SeriesUncheckedUpdateWithoutStoriesInputSchema) ]).optional(),
}).strict();

export default SeriesUpdateOneWithoutStoriesNestedInputSchema;
