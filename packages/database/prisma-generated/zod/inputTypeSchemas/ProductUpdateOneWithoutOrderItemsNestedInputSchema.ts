import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutOrderItemsInputSchema } from './ProductCreateWithoutOrderItemsInputSchema';
import { ProductUncheckedCreateWithoutOrderItemsInputSchema } from './ProductUncheckedCreateWithoutOrderItemsInputSchema';
import { ProductCreateOrConnectWithoutOrderItemsInputSchema } from './ProductCreateOrConnectWithoutOrderItemsInputSchema';
import { ProductUpsertWithoutOrderItemsInputSchema } from './ProductUpsertWithoutOrderItemsInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateToOneWithWhereWithoutOrderItemsInputSchema } from './ProductUpdateToOneWithWhereWithoutOrderItemsInputSchema';
import { ProductUpdateWithoutOrderItemsInputSchema } from './ProductUpdateWithoutOrderItemsInputSchema';
import { ProductUncheckedUpdateWithoutOrderItemsInputSchema } from './ProductUncheckedUpdateWithoutOrderItemsInputSchema';

export const ProductUpdateOneWithoutOrderItemsNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneWithoutOrderItemsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutOrderItemsInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutOrderItemsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutOrderItemsInputSchema).optional(),
      upsert: z.lazy(() => ProductUpsertWithoutOrderItemsInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => ProductWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => ProductWhereInputSchema)]).optional(),
      connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => ProductUpdateToOneWithWhereWithoutOrderItemsInputSchema),
          z.lazy(() => ProductUpdateWithoutOrderItemsInputSchema),
          z.lazy(() => ProductUncheckedUpdateWithoutOrderItemsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default ProductUpdateOneWithoutOrderItemsNestedInputSchema;
