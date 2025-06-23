import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomCreateWithoutSeriesInputSchema } from './FandomCreateWithoutSeriesInputSchema';
import { FandomUncheckedCreateWithoutSeriesInputSchema } from './FandomUncheckedCreateWithoutSeriesInputSchema';
import { FandomCreateOrConnectWithoutSeriesInputSchema } from './FandomCreateOrConnectWithoutSeriesInputSchema';
import { FandomUpsertWithoutSeriesInputSchema } from './FandomUpsertWithoutSeriesInputSchema';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomUpdateToOneWithWhereWithoutSeriesInputSchema } from './FandomUpdateToOneWithWhereWithoutSeriesInputSchema';
import { FandomUpdateWithoutSeriesInputSchema } from './FandomUpdateWithoutSeriesInputSchema';
import { FandomUncheckedUpdateWithoutSeriesInputSchema } from './FandomUncheckedUpdateWithoutSeriesInputSchema';

export const FandomUpdateOneRequiredWithoutSeriesNestedInputSchema: z.ZodType<Prisma.FandomUpdateOneRequiredWithoutSeriesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => FandomCreateWithoutSeriesInputSchema),
          z.lazy(() => FandomUncheckedCreateWithoutSeriesInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => FandomCreateOrConnectWithoutSeriesInputSchema).optional(),
      upsert: z.lazy(() => FandomUpsertWithoutSeriesInputSchema).optional(),
      connect: z.lazy(() => FandomWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => FandomUpdateToOneWithWhereWithoutSeriesInputSchema),
          z.lazy(() => FandomUpdateWithoutSeriesInputSchema),
          z.lazy(() => FandomUncheckedUpdateWithoutSeriesInputSchema),
        ])
        .optional(),
    })
    .strict();

export default FandomUpdateOneRequiredWithoutSeriesNestedInputSchema;
