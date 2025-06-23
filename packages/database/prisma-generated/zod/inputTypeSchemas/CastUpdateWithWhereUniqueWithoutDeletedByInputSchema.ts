import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';
import { CastUpdateWithoutDeletedByInputSchema } from './CastUpdateWithoutDeletedByInputSchema';
import { CastUncheckedUpdateWithoutDeletedByInputSchema } from './CastUncheckedUpdateWithoutDeletedByInputSchema';

export const CastUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.CastUpdateWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => CastWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => CastUpdateWithoutDeletedByInputSchema),
        z.lazy(() => CastUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default CastUpdateWithWhereUniqueWithoutDeletedByInputSchema;
