import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomUpdateWithoutDeletedByInputSchema } from './FandomUpdateWithoutDeletedByInputSchema';
import { FandomUncheckedUpdateWithoutDeletedByInputSchema } from './FandomUncheckedUpdateWithoutDeletedByInputSchema';
import { FandomCreateWithoutDeletedByInputSchema } from './FandomCreateWithoutDeletedByInputSchema';
import { FandomUncheckedCreateWithoutDeletedByInputSchema } from './FandomUncheckedCreateWithoutDeletedByInputSchema';

export const FandomUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.FandomUpsertWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => FandomWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => FandomUpdateWithoutDeletedByInputSchema),
        z.lazy(() => FandomUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
      create: z.union([
        z.lazy(() => FandomCreateWithoutDeletedByInputSchema),
        z.lazy(() => FandomUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default FandomUpsertWithWhereUniqueWithoutDeletedByInputSchema;
