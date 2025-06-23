import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutInventoryInputSchema } from './ProductCreateWithoutInventoryInputSchema';
import { ProductUncheckedCreateWithoutInventoryInputSchema } from './ProductUncheckedCreateWithoutInventoryInputSchema';
import { ProductCreateOrConnectWithoutInventoryInputSchema } from './ProductCreateOrConnectWithoutInventoryInputSchema';
import { ProductUpsertWithoutInventoryInputSchema } from './ProductUpsertWithoutInventoryInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateToOneWithWhereWithoutInventoryInputSchema } from './ProductUpdateToOneWithWhereWithoutInventoryInputSchema';
import { ProductUpdateWithoutInventoryInputSchema } from './ProductUpdateWithoutInventoryInputSchema';
import { ProductUncheckedUpdateWithoutInventoryInputSchema } from './ProductUncheckedUpdateWithoutInventoryInputSchema';

export const ProductUpdateOneWithoutInventoryNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneWithoutInventoryNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutInventoryInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutInventoryInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutInventoryInputSchema).optional(),
      upsert: z.lazy(() => ProductUpsertWithoutInventoryInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => ProductWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => ProductWhereInputSchema)]).optional(),
      connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => ProductUpdateToOneWithWhereWithoutInventoryInputSchema),
          z.lazy(() => ProductUpdateWithoutInventoryInputSchema),
          z.lazy(() => ProductUncheckedUpdateWithoutInventoryInputSchema),
        ])
        .optional(),
    })
    .strict();

export default ProductUpdateOneWithoutInventoryNestedInputSchema;
