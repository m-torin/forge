import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutMediaInputSchema } from './ProductCreateWithoutMediaInputSchema';
import { ProductUncheckedCreateWithoutMediaInputSchema } from './ProductUncheckedCreateWithoutMediaInputSchema';
import { ProductCreateOrConnectWithoutMediaInputSchema } from './ProductCreateOrConnectWithoutMediaInputSchema';
import { ProductUpsertWithoutMediaInputSchema } from './ProductUpsertWithoutMediaInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateToOneWithWhereWithoutMediaInputSchema } from './ProductUpdateToOneWithWhereWithoutMediaInputSchema';
import { ProductUpdateWithoutMediaInputSchema } from './ProductUpdateWithoutMediaInputSchema';
import { ProductUncheckedUpdateWithoutMediaInputSchema } from './ProductUncheckedUpdateWithoutMediaInputSchema';

export const ProductUpdateOneWithoutMediaNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneWithoutMediaNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutMediaInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutMediaInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutMediaInputSchema).optional(),
      upsert: z.lazy(() => ProductUpsertWithoutMediaInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => ProductWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => ProductWhereInputSchema)]).optional(),
      connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => ProductUpdateToOneWithWhereWithoutMediaInputSchema),
          z.lazy(() => ProductUpdateWithoutMediaInputSchema),
          z.lazy(() => ProductUncheckedUpdateWithoutMediaInputSchema),
        ])
        .optional(),
    })
    .strict();

export default ProductUpdateOneWithoutMediaNestedInputSchema;
