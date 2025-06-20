import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesCreateWithoutJrFindReplaceRejectsInputSchema } from './SeriesCreateWithoutJrFindReplaceRejectsInputSchema';
import { SeriesUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './SeriesUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';
import { SeriesCreateOrConnectWithoutJrFindReplaceRejectsInputSchema } from './SeriesCreateOrConnectWithoutJrFindReplaceRejectsInputSchema';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';

export const SeriesCreateNestedManyWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.SeriesCreateNestedManyWithoutJrFindReplaceRejectsInput> = z.object({
  create: z.union([ z.lazy(() => SeriesCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => SeriesCreateWithoutJrFindReplaceRejectsInputSchema).array(),z.lazy(() => SeriesUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => SeriesUncheckedCreateWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => SeriesCreateOrConnectWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => SeriesCreateOrConnectWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => SeriesWhereUniqueInputSchema),z.lazy(() => SeriesWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default SeriesCreateNestedManyWithoutJrFindReplaceRejectsInputSchema;
