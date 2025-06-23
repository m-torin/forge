import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryCreateWithoutCollectionsInputSchema } from './ProductCategoryCreateWithoutCollectionsInputSchema';
import { ProductCategoryUncheckedCreateWithoutCollectionsInputSchema } from './ProductCategoryUncheckedCreateWithoutCollectionsInputSchema';
import { ProductCategoryCreateOrConnectWithoutCollectionsInputSchema } from './ProductCategoryCreateOrConnectWithoutCollectionsInputSchema';
import { ProductCategoryUpsertWithWhereUniqueWithoutCollectionsInputSchema } from './ProductCategoryUpsertWithWhereUniqueWithoutCollectionsInputSchema';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryUpdateWithWhereUniqueWithoutCollectionsInputSchema } from './ProductCategoryUpdateWithWhereUniqueWithoutCollectionsInputSchema';
import { ProductCategoryUpdateManyWithWhereWithoutCollectionsInputSchema } from './ProductCategoryUpdateManyWithWhereWithoutCollectionsInputSchema';
import { ProductCategoryScalarWhereInputSchema } from './ProductCategoryScalarWhereInputSchema';

export const ProductCategoryUpdateManyWithoutCollectionsNestedInputSchema: z.ZodType<Prisma.ProductCategoryUpdateManyWithoutCollectionsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCategoryCreateWithoutCollectionsInputSchema),
          z.lazy(() => ProductCategoryCreateWithoutCollectionsInputSchema).array(),
          z.lazy(() => ProductCategoryUncheckedCreateWithoutCollectionsInputSchema),
          z.lazy(() => ProductCategoryUncheckedCreateWithoutCollectionsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductCategoryCreateOrConnectWithoutCollectionsInputSchema),
          z.lazy(() => ProductCategoryCreateOrConnectWithoutCollectionsInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => ProductCategoryUpsertWithWhereUniqueWithoutCollectionsInputSchema),
          z.lazy(() => ProductCategoryUpsertWithWhereUniqueWithoutCollectionsInputSchema).array(),
        ])
        .optional(),
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
          z.lazy(() => ProductCategoryUpdateWithWhereUniqueWithoutCollectionsInputSchema),
          z.lazy(() => ProductCategoryUpdateWithWhereUniqueWithoutCollectionsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ProductCategoryUpdateManyWithWhereWithoutCollectionsInputSchema),
          z.lazy(() => ProductCategoryUpdateManyWithWhereWithoutCollectionsInputSchema).array(),
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

export default ProductCategoryUpdateManyWithoutCollectionsNestedInputSchema;
