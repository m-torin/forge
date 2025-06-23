import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereInputSchema } from './FandomWhereInputSchema';
import { FandomUpdateWithoutSeriesInputSchema } from './FandomUpdateWithoutSeriesInputSchema';
import { FandomUncheckedUpdateWithoutSeriesInputSchema } from './FandomUncheckedUpdateWithoutSeriesInputSchema';

export const FandomUpdateToOneWithWhereWithoutSeriesInputSchema: z.ZodType<Prisma.FandomUpdateToOneWithWhereWithoutSeriesInput> =
  z
    .object({
      where: z.lazy(() => FandomWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => FandomUpdateWithoutSeriesInputSchema),
        z.lazy(() => FandomUncheckedUpdateWithoutSeriesInputSchema),
      ]),
    })
    .strict();

export default FandomUpdateToOneWithWhereWithoutSeriesInputSchema;
