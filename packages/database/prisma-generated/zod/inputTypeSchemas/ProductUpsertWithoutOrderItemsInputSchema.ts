import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductUpdateWithoutOrderItemsInputSchema } from './ProductUpdateWithoutOrderItemsInputSchema';
import { ProductUncheckedUpdateWithoutOrderItemsInputSchema } from './ProductUncheckedUpdateWithoutOrderItemsInputSchema';
import { ProductCreateWithoutOrderItemsInputSchema } from './ProductCreateWithoutOrderItemsInputSchema';
import { ProductUncheckedCreateWithoutOrderItemsInputSchema } from './ProductUncheckedCreateWithoutOrderItemsInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductUpsertWithoutOrderItemsInputSchema: z.ZodType<Prisma.ProductUpsertWithoutOrderItemsInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => ProductUpdateWithoutOrderItemsInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutOrderItemsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutOrderItemsInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutOrderItemsInputSchema),
      ]),
      where: z.lazy(() => ProductWhereInputSchema).optional(),
    })
    .strict();

export default ProductUpsertWithoutOrderItemsInputSchema;
