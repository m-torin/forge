import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutCastsInputSchema } from './ProductCreateWithoutCastsInputSchema';
import { ProductUncheckedCreateWithoutCastsInputSchema } from './ProductUncheckedCreateWithoutCastsInputSchema';
import { ProductCreateOrConnectWithoutCastsInputSchema } from './ProductCreateOrConnectWithoutCastsInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductUncheckedCreateNestedManyWithoutCastsInputSchema: z.ZodType<Prisma.ProductUncheckedCreateNestedManyWithoutCastsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutCastsInputSchema),
          z.lazy(() => ProductCreateWithoutCastsInputSchema).array(),
          z.lazy(() => ProductUncheckedCreateWithoutCastsInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutCastsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductCreateOrConnectWithoutCastsInputSchema),
          z.lazy(() => ProductCreateOrConnectWithoutCastsInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => ProductWhereUniqueInputSchema),
          z.lazy(() => ProductWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ProductUncheckedCreateNestedManyWithoutCastsInputSchema;
