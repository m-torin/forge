import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutCartItemsInputSchema } from './ProductCreateWithoutCartItemsInputSchema';
import { ProductUncheckedCreateWithoutCartItemsInputSchema } from './ProductUncheckedCreateWithoutCartItemsInputSchema';
import { ProductCreateOrConnectWithoutCartItemsInputSchema } from './ProductCreateOrConnectWithoutCartItemsInputSchema';
import { ProductUpsertWithoutCartItemsInputSchema } from './ProductUpsertWithoutCartItemsInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateToOneWithWhereWithoutCartItemsInputSchema } from './ProductUpdateToOneWithWhereWithoutCartItemsInputSchema';
import { ProductUpdateWithoutCartItemsInputSchema } from './ProductUpdateWithoutCartItemsInputSchema';
import { ProductUncheckedUpdateWithoutCartItemsInputSchema } from './ProductUncheckedUpdateWithoutCartItemsInputSchema';

export const ProductUpdateOneWithoutCartItemsNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneWithoutCartItemsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutCartItemsInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutCartItemsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutCartItemsInputSchema).optional(),
      upsert: z.lazy(() => ProductUpsertWithoutCartItemsInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => ProductWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => ProductWhereInputSchema)]).optional(),
      connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => ProductUpdateToOneWithWhereWithoutCartItemsInputSchema),
          z.lazy(() => ProductUpdateWithoutCartItemsInputSchema),
          z.lazy(() => ProductUncheckedUpdateWithoutCartItemsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default ProductUpdateOneWithoutCartItemsNestedInputSchema;
