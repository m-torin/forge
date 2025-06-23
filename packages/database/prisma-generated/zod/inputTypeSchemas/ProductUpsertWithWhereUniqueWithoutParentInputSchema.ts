import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutParentInputSchema } from './ProductUpdateWithoutParentInputSchema';
import { ProductUncheckedUpdateWithoutParentInputSchema } from './ProductUncheckedUpdateWithoutParentInputSchema';
import { ProductCreateWithoutParentInputSchema } from './ProductCreateWithoutParentInputSchema';
import { ProductUncheckedCreateWithoutParentInputSchema } from './ProductUncheckedCreateWithoutParentInputSchema';

export const ProductUpsertWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutParentInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ProductUpdateWithoutParentInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutParentInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutParentInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutParentInputSchema),
      ]),
    })
    .strict();

export default ProductUpsertWithWhereUniqueWithoutParentInputSchema;
