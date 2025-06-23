import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesUpdateWithoutFandomInputSchema } from './SeriesUpdateWithoutFandomInputSchema';
import { SeriesUncheckedUpdateWithoutFandomInputSchema } from './SeriesUncheckedUpdateWithoutFandomInputSchema';
import { SeriesCreateWithoutFandomInputSchema } from './SeriesCreateWithoutFandomInputSchema';
import { SeriesUncheckedCreateWithoutFandomInputSchema } from './SeriesUncheckedCreateWithoutFandomInputSchema';

export const SeriesUpsertWithWhereUniqueWithoutFandomInputSchema: z.ZodType<Prisma.SeriesUpsertWithWhereUniqueWithoutFandomInput> =
  z
    .object({
      where: z.lazy(() => SeriesWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => SeriesUpdateWithoutFandomInputSchema),
        z.lazy(() => SeriesUncheckedUpdateWithoutFandomInputSchema),
      ]),
      create: z.union([
        z.lazy(() => SeriesCreateWithoutFandomInputSchema),
        z.lazy(() => SeriesUncheckedCreateWithoutFandomInputSchema),
      ]),
    })
    .strict();

export default SeriesUpsertWithWhereUniqueWithoutFandomInputSchema;
