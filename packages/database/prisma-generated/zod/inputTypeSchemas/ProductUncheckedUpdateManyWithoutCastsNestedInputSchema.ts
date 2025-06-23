import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutCastsInputSchema } from './ProductCreateWithoutCastsInputSchema';
import { ProductUncheckedCreateWithoutCastsInputSchema } from './ProductUncheckedCreateWithoutCastsInputSchema';
import { ProductCreateOrConnectWithoutCastsInputSchema } from './ProductCreateOrConnectWithoutCastsInputSchema';
import { ProductUpsertWithWhereUniqueWithoutCastsInputSchema } from './ProductUpsertWithWhereUniqueWithoutCastsInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithWhereUniqueWithoutCastsInputSchema } from './ProductUpdateWithWhereUniqueWithoutCastsInputSchema';
import { ProductUpdateManyWithWhereWithoutCastsInputSchema } from './ProductUpdateManyWithWhereWithoutCastsInputSchema';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';

export const ProductUncheckedUpdateManyWithoutCastsNestedInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutCastsNestedInput> =
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
      upsert: z
        .union([
          z.lazy(() => ProductUpsertWithWhereUniqueWithoutCastsInputSchema),
          z.lazy(() => ProductUpsertWithWhereUniqueWithoutCastsInputSchema).array(),
        ])
        .optional(),
      set: z
        .union([
          z.lazy(() => ProductWhereUniqueInputSchema),
          z.lazy(() => ProductWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => ProductWhereUniqueInputSchema),
          z.lazy(() => ProductWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => ProductWhereUniqueInputSchema),
          z.lazy(() => ProductWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => ProductWhereUniqueInputSchema),
          z.lazy(() => ProductWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => ProductUpdateWithWhereUniqueWithoutCastsInputSchema),
          z.lazy(() => ProductUpdateWithWhereUniqueWithoutCastsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ProductUpdateManyWithWhereWithoutCastsInputSchema),
          z.lazy(() => ProductUpdateManyWithWhereWithoutCastsInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => ProductScalarWhereInputSchema),
          z.lazy(() => ProductScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ProductUncheckedUpdateManyWithoutCastsNestedInputSchema;
