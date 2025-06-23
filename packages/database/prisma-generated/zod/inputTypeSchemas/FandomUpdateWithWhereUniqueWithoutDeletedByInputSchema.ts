import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomUpdateWithoutDeletedByInputSchema } from './FandomUpdateWithoutDeletedByInputSchema';
import { FandomUncheckedUpdateWithoutDeletedByInputSchema } from './FandomUncheckedUpdateWithoutDeletedByInputSchema';

export const FandomUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.FandomUpdateWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => FandomWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => FandomUpdateWithoutDeletedByInputSchema),
        z.lazy(() => FandomUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default FandomUpdateWithWhereUniqueWithoutDeletedByInputSchema;
