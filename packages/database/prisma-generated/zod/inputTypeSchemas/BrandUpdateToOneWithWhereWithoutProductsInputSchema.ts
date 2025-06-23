import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';
import { BrandUpdateWithoutProductsInputSchema } from './BrandUpdateWithoutProductsInputSchema';
import { BrandUncheckedUpdateWithoutProductsInputSchema } from './BrandUncheckedUpdateWithoutProductsInputSchema';

export const BrandUpdateToOneWithWhereWithoutProductsInputSchema: z.ZodType<Prisma.BrandUpdateToOneWithWhereWithoutProductsInput> =
  z
    .object({
      where: z.lazy(() => BrandWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => BrandUpdateWithoutProductsInputSchema),
        z.lazy(() => BrandUncheckedUpdateWithoutProductsInputSchema),
      ]),
    })
    .strict();

export default BrandUpdateToOneWithWhereWithoutProductsInputSchema;
