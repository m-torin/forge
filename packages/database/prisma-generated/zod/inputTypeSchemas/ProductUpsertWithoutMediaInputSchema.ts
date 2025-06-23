import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductUpdateWithoutMediaInputSchema } from './ProductUpdateWithoutMediaInputSchema';
import { ProductUncheckedUpdateWithoutMediaInputSchema } from './ProductUncheckedUpdateWithoutMediaInputSchema';
import { ProductCreateWithoutMediaInputSchema } from './ProductCreateWithoutMediaInputSchema';
import { ProductUncheckedCreateWithoutMediaInputSchema } from './ProductUncheckedCreateWithoutMediaInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductUpsertWithoutMediaInputSchema: z.ZodType<Prisma.ProductUpsertWithoutMediaInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => ProductUpdateWithoutMediaInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutMediaInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutMediaInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutMediaInputSchema),
      ]),
      where: z.lazy(() => ProductWhereInputSchema).optional(),
    })
    .strict();

export default ProductUpsertWithoutMediaInputSchema;
