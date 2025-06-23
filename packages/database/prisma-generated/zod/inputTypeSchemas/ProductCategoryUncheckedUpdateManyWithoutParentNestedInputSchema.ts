import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryCreateWithoutParentInputSchema } from './ProductCategoryCreateWithoutParentInputSchema';
import { ProductCategoryUncheckedCreateWithoutParentInputSchema } from './ProductCategoryUncheckedCreateWithoutParentInputSchema';
import { ProductCategoryCreateOrConnectWithoutParentInputSchema } from './ProductCategoryCreateOrConnectWithoutParentInputSchema';
import { ProductCategoryUpsertWithWhereUniqueWithoutParentInputSchema } from './ProductCategoryUpsertWithWhereUniqueWithoutParentInputSchema';
import { ProductCategoryCreateManyParentInputEnvelopeSchema } from './ProductCategoryCreateManyParentInputEnvelopeSchema';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryUpdateWithWhereUniqueWithoutParentInputSchema } from './ProductCategoryUpdateWithWhereUniqueWithoutParentInputSchema';
import { ProductCategoryUpdateManyWithWhereWithoutParentInputSchema } from './ProductCategoryUpdateManyWithWhereWithoutParentInputSchema';
import { ProductCategoryScalarWhereInputSchema } from './ProductCategoryScalarWhereInputSchema';

export const ProductCategoryUncheckedUpdateManyWithoutParentNestedInputSchema: z.ZodType<Prisma.ProductCategoryUncheckedUpdateManyWithoutParentNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCategoryCreateWithoutParentInputSchema),
          z.lazy(() => ProductCategoryCreateWithoutParentInputSchema).array(),
          z.lazy(() => ProductCategoryUncheckedCreateWithoutParentInputSchema),
          z.lazy(() => ProductCategoryUncheckedCreateWithoutParentInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductCategoryCreateOrConnectWithoutParentInputSchema),
          z.lazy(() => ProductCategoryCreateOrConnectWithoutParentInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => ProductCategoryUpsertWithWhereUniqueWithoutParentInputSchema),
          z.lazy(() => ProductCategoryUpsertWithWhereUniqueWithoutParentInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ProductCategoryCreateManyParentInputEnvelopeSchema).optional(),
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
          z.lazy(() => ProductCategoryUpdateWithWhereUniqueWithoutParentInputSchema),
          z.lazy(() => ProductCategoryUpdateWithWhereUniqueWithoutParentInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ProductCategoryUpdateManyWithWhereWithoutParentInputSchema),
          z.lazy(() => ProductCategoryUpdateManyWithWhereWithoutParentInputSchema).array(),
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

export default ProductCategoryUncheckedUpdateManyWithoutParentNestedInputSchema;
