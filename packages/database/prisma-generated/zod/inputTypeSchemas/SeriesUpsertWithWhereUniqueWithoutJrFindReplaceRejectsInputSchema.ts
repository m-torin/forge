import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesUpdateWithoutJrFindReplaceRejectsInputSchema } from './SeriesUpdateWithoutJrFindReplaceRejectsInputSchema';
import { SeriesUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema } from './SeriesUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema';
import { SeriesCreateWithoutJrFindReplaceRejectsInputSchema } from './SeriesCreateWithoutJrFindReplaceRejectsInputSchema';
import { SeriesUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './SeriesUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';

export const SeriesUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.SeriesUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => SeriesWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => SeriesUpdateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => SeriesUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => SeriesCreateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => SeriesUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default SeriesUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema;
