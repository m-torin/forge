import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductUpdateWithoutIdentifiersInputSchema } from './ProductUpdateWithoutIdentifiersInputSchema';
import { ProductUncheckedUpdateWithoutIdentifiersInputSchema } from './ProductUncheckedUpdateWithoutIdentifiersInputSchema';
import { ProductCreateWithoutIdentifiersInputSchema } from './ProductCreateWithoutIdentifiersInputSchema';
import { ProductUncheckedCreateWithoutIdentifiersInputSchema } from './ProductUncheckedCreateWithoutIdentifiersInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductUpsertWithoutIdentifiersInputSchema: z.ZodType<Prisma.ProductUpsertWithoutIdentifiersInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => ProductUpdateWithoutIdentifiersInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutIdentifiersInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutIdentifiersInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutIdentifiersInputSchema),
      ]),
      where: z.lazy(() => ProductWhereInputSchema).optional(),
    })
    .strict();

export default ProductUpsertWithoutIdentifiersInputSchema;
