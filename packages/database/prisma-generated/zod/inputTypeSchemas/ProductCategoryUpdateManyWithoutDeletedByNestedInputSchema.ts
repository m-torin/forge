import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryCreateWithoutDeletedByInputSchema } from './ProductCategoryCreateWithoutDeletedByInputSchema';
import { ProductCategoryUncheckedCreateWithoutDeletedByInputSchema } from './ProductCategoryUncheckedCreateWithoutDeletedByInputSchema';
import { ProductCategoryCreateOrConnectWithoutDeletedByInputSchema } from './ProductCategoryCreateOrConnectWithoutDeletedByInputSchema';
import { ProductCategoryUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './ProductCategoryUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { ProductCategoryCreateManyDeletedByInputEnvelopeSchema } from './ProductCategoryCreateManyDeletedByInputEnvelopeSchema';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './ProductCategoryUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { ProductCategoryUpdateManyWithWhereWithoutDeletedByInputSchema } from './ProductCategoryUpdateManyWithWhereWithoutDeletedByInputSchema';
import { ProductCategoryScalarWhereInputSchema } from './ProductCategoryScalarWhereInputSchema';

export const ProductCategoryUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.ProductCategoryUpdateManyWithoutDeletedByNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCategoryCreateWithoutDeletedByInputSchema),
          z.lazy(() => ProductCategoryCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => ProductCategoryUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => ProductCategoryUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductCategoryCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => ProductCategoryCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => ProductCategoryUpsertWithWhereUniqueWithoutDeletedByInputSchema),
          z.lazy(() => ProductCategoryUpsertWithWhereUniqueWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ProductCategoryCreateManyDeletedByInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => ProductCategoryWhereUniqueInputSchema),
          z.lazy(() => ProductCategoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => ProductCategoryWhereUniqueInputSchema),
          z.lazy(() => ProductCategoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => ProductCategoryWhereUniqueInputSchema),
          z.lazy(() => ProductCategoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => ProductCategoryWhereUniqueInputSchema),
          z.lazy(() => ProductCategoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => ProductCategoryUpdateWithWhereUniqueWithoutDeletedByInputSchema),
          z.lazy(() => ProductCategoryUpdateWithWhereUniqueWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ProductCategoryUpdateManyWithWhereWithoutDeletedByInputSchema),
          z.lazy(() => ProductCategoryUpdateManyWithWhereWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => ProductCategoryScalarWhereInputSchema),
          z.lazy(() => ProductCategoryScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ProductCategoryUpdateManyWithoutDeletedByNestedInputSchema;
