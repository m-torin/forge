import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesUpdateWithoutFandomInputSchema } from './SeriesUpdateWithoutFandomInputSchema';
import { SeriesUncheckedUpdateWithoutFandomInputSchema } from './SeriesUncheckedUpdateWithoutFandomInputSchema';

export const SeriesUpdateWithWhereUniqueWithoutFandomInputSchema: z.ZodType<Prisma.SeriesUpdateWithWhereUniqueWithoutFandomInput> =
  z
    .object({
      where: z.lazy(() => SeriesWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => SeriesUpdateWithoutFandomInputSchema),
        z.lazy(() => SeriesUncheckedUpdateWithoutFandomInputSchema),
      ]),
    })
    .strict();

export default SeriesUpdateWithWhereUniqueWithoutFandomInputSchema;
