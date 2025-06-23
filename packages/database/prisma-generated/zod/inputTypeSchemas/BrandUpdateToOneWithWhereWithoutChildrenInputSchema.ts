import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';
import { BrandUpdateWithoutChildrenInputSchema } from './BrandUpdateWithoutChildrenInputSchema';
import { BrandUncheckedUpdateWithoutChildrenInputSchema } from './BrandUncheckedUpdateWithoutChildrenInputSchema';

export const BrandUpdateToOneWithWhereWithoutChildrenInputSchema: z.ZodType<Prisma.BrandUpdateToOneWithWhereWithoutChildrenInput> =
  z
    .object({
      where: z.lazy(() => BrandWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => BrandUpdateWithoutChildrenInputSchema),
        z.lazy(() => BrandUncheckedUpdateWithoutChildrenInputSchema),
      ]),
    })
    .strict();

export default BrandUpdateToOneWithWhereWithoutChildrenInputSchema;
