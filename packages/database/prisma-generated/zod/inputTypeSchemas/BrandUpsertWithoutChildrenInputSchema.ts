import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandUpdateWithoutChildrenInputSchema } from './BrandUpdateWithoutChildrenInputSchema';
import { BrandUncheckedUpdateWithoutChildrenInputSchema } from './BrandUncheckedUpdateWithoutChildrenInputSchema';
import { BrandCreateWithoutChildrenInputSchema } from './BrandCreateWithoutChildrenInputSchema';
import { BrandUncheckedCreateWithoutChildrenInputSchema } from './BrandUncheckedCreateWithoutChildrenInputSchema';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';

export const BrandUpsertWithoutChildrenInputSchema: z.ZodType<Prisma.BrandUpsertWithoutChildrenInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => BrandUpdateWithoutChildrenInputSchema),
        z.lazy(() => BrandUncheckedUpdateWithoutChildrenInputSchema),
      ]),
      create: z.union([
        z.lazy(() => BrandCreateWithoutChildrenInputSchema),
        z.lazy(() => BrandUncheckedCreateWithoutChildrenInputSchema),
      ]),
      where: z.lazy(() => BrandWhereInputSchema).optional(),
    })
    .strict();

export default BrandUpsertWithoutChildrenInputSchema;
