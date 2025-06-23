import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesUpdateWithoutProductsInputSchema } from './SeriesUpdateWithoutProductsInputSchema';
import { SeriesUncheckedUpdateWithoutProductsInputSchema } from './SeriesUncheckedUpdateWithoutProductsInputSchema';

export const SeriesUpdateWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.SeriesUpdateWithWhereUniqueWithoutProductsInput> =
  z
    .object({
      where: z.lazy(() => SeriesWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => SeriesUpdateWithoutProductsInputSchema),
        z.lazy(() => SeriesUncheckedUpdateWithoutProductsInputSchema),
      ]),
    })
    .strict();

export default SeriesUpdateWithWhereUniqueWithoutProductsInputSchema;
