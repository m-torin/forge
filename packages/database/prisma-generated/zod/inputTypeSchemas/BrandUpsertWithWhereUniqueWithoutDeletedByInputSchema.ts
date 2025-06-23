import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateWithoutDeletedByInputSchema } from './BrandUpdateWithoutDeletedByInputSchema';
import { BrandUncheckedUpdateWithoutDeletedByInputSchema } from './BrandUncheckedUpdateWithoutDeletedByInputSchema';
import { BrandCreateWithoutDeletedByInputSchema } from './BrandCreateWithoutDeletedByInputSchema';
import { BrandUncheckedCreateWithoutDeletedByInputSchema } from './BrandUncheckedCreateWithoutDeletedByInputSchema';

export const BrandUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.BrandUpsertWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => BrandWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => BrandUpdateWithoutDeletedByInputSchema),
        z.lazy(() => BrandUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
      create: z.union([
        z.lazy(() => BrandCreateWithoutDeletedByInputSchema),
        z.lazy(() => BrandUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default BrandUpsertWithWhereUniqueWithoutDeletedByInputSchema;
