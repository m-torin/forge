import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandCreateWithoutDeletedByInputSchema } from './BrandCreateWithoutDeletedByInputSchema';
import { BrandUncheckedCreateWithoutDeletedByInputSchema } from './BrandUncheckedCreateWithoutDeletedByInputSchema';

export const BrandCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.BrandCreateOrConnectWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => BrandWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => BrandCreateWithoutDeletedByInputSchema),
        z.lazy(() => BrandUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default BrandCreateOrConnectWithoutDeletedByInputSchema;
