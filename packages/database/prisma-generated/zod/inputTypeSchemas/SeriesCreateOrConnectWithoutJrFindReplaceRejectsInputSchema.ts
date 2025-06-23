import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesCreateWithoutJrFindReplaceRejectsInputSchema } from './SeriesCreateWithoutJrFindReplaceRejectsInputSchema';
import { SeriesUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './SeriesUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';

export const SeriesCreateOrConnectWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.SeriesCreateOrConnectWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => SeriesWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => SeriesCreateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => SeriesUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default SeriesCreateOrConnectWithoutJrFindReplaceRejectsInputSchema;
