import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomCreateWithoutSeriesInputSchema } from './FandomCreateWithoutSeriesInputSchema';
import { FandomUncheckedCreateWithoutSeriesInputSchema } from './FandomUncheckedCreateWithoutSeriesInputSchema';

export const FandomCreateOrConnectWithoutSeriesInputSchema: z.ZodType<Prisma.FandomCreateOrConnectWithoutSeriesInput> =
  z
    .object({
      where: z.lazy(() => FandomWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => FandomCreateWithoutSeriesInputSchema),
        z.lazy(() => FandomUncheckedCreateWithoutSeriesInputSchema),
      ]),
    })
    .strict();

export default FandomCreateOrConnectWithoutSeriesInputSchema;
