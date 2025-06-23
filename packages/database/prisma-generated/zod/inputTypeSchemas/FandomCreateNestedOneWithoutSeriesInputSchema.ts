import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomCreateWithoutSeriesInputSchema } from './FandomCreateWithoutSeriesInputSchema';
import { FandomUncheckedCreateWithoutSeriesInputSchema } from './FandomUncheckedCreateWithoutSeriesInputSchema';
import { FandomCreateOrConnectWithoutSeriesInputSchema } from './FandomCreateOrConnectWithoutSeriesInputSchema';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';

export const FandomCreateNestedOneWithoutSeriesInputSchema: z.ZodType<Prisma.FandomCreateNestedOneWithoutSeriesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => FandomCreateWithoutSeriesInputSchema),
          z.lazy(() => FandomUncheckedCreateWithoutSeriesInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => FandomCreateOrConnectWithoutSeriesInputSchema).optional(),
      connect: z.lazy(() => FandomWhereUniqueInputSchema).optional(),
    })
    .strict();

export default FandomCreateNestedOneWithoutSeriesInputSchema;
