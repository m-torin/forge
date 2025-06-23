import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutDeletedByInputSchema } from './ProductUpdateWithoutDeletedByInputSchema';
import { ProductUncheckedUpdateWithoutDeletedByInputSchema } from './ProductUncheckedUpdateWithoutDeletedByInputSchema';
import { ProductCreateWithoutDeletedByInputSchema } from './ProductCreateWithoutDeletedByInputSchema';
import { ProductUncheckedCreateWithoutDeletedByInputSchema } from './ProductUncheckedCreateWithoutDeletedByInputSchema';

export const ProductUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ProductUpdateWithoutDeletedByInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutDeletedByInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default ProductUpsertWithWhereUniqueWithoutDeletedByInputSchema;
