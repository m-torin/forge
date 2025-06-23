import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesUpdateWithoutProductsInputSchema } from './SeriesUpdateWithoutProductsInputSchema';
import { SeriesUncheckedUpdateWithoutProductsInputSchema } from './SeriesUncheckedUpdateWithoutProductsInputSchema';
import { SeriesCreateWithoutProductsInputSchema } from './SeriesCreateWithoutProductsInputSchema';
import { SeriesUncheckedCreateWithoutProductsInputSchema } from './SeriesUncheckedCreateWithoutProductsInputSchema';

export const SeriesUpsertWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.SeriesUpsertWithWhereUniqueWithoutProductsInput> =
  z
    .object({
      where: z.lazy(() => SeriesWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => SeriesUpdateWithoutProductsInputSchema),
        z.lazy(() => SeriesUncheckedUpdateWithoutProductsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => SeriesCreateWithoutProductsInputSchema),
        z.lazy(() => SeriesUncheckedCreateWithoutProductsInputSchema),
      ]),
    })
    .strict();

export default SeriesUpsertWithWhereUniqueWithoutProductsInputSchema;
