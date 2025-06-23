import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesUpdateWithoutJrFindReplaceRejectsInputSchema } from './SeriesUpdateWithoutJrFindReplaceRejectsInputSchema';
import { SeriesUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema } from './SeriesUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema';

export const SeriesUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.SeriesUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => SeriesWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => SeriesUpdateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => SeriesUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default SeriesUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema;
