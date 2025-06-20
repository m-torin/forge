import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomUpdateWithoutSeriesInputSchema } from './FandomUpdateWithoutSeriesInputSchema';
import { FandomUncheckedUpdateWithoutSeriesInputSchema } from './FandomUncheckedUpdateWithoutSeriesInputSchema';
import { FandomCreateWithoutSeriesInputSchema } from './FandomCreateWithoutSeriesInputSchema';
import { FandomUncheckedCreateWithoutSeriesInputSchema } from './FandomUncheckedCreateWithoutSeriesInputSchema';
import { FandomWhereInputSchema } from './FandomWhereInputSchema';

export const FandomUpsertWithoutSeriesInputSchema: z.ZodType<Prisma.FandomUpsertWithoutSeriesInput> = z.object({
  update: z.union([ z.lazy(() => FandomUpdateWithoutSeriesInputSchema),z.lazy(() => FandomUncheckedUpdateWithoutSeriesInputSchema) ]),
  create: z.union([ z.lazy(() => FandomCreateWithoutSeriesInputSchema),z.lazy(() => FandomUncheckedCreateWithoutSeriesInputSchema) ]),
  where: z.lazy(() => FandomWhereInputSchema).optional()
}).strict();

export default FandomUpsertWithoutSeriesInputSchema;
