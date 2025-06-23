import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithoutDeletedByInputSchema } from './BrandUpdateWithoutDeletedByInputSchema';
import { BrandUncheckedUpdateWithoutDeletedByInputSchema } from './BrandUncheckedUpdateWithoutDeletedByInputSchema';

export const BrandUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.BrandUpdateWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => BrandWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => BrandUpdateWithoutDeletedByInputSchema),
        z.lazy(() => BrandUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default BrandUpdateWithWhereUniqueWithoutDeletedByInputSchema;
