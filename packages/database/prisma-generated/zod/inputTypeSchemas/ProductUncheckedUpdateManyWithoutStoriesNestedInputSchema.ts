import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutStoriesInputSchema } from './ProductCreateWithoutStoriesInputSchema';
import { ProductUncheckedCreateWithoutStoriesInputSchema } from './ProductUncheckedCreateWithoutStoriesInputSchema';
import { ProductCreateOrConnectWithoutStoriesInputSchema } from './ProductCreateOrConnectWithoutStoriesInputSchema';
import { ProductUpsertWithWhereUniqueWithoutStoriesInputSchema } from './ProductUpsertWithWhereUniqueWithoutStoriesInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithWhereUniqueWithoutStoriesInputSchema } from './ProductUpdateWithWhereUniqueWithoutStoriesInputSchema';
import { ProductUpdateManyWithWhereWithoutStoriesInputSchema } from './ProductUpdateManyWithWhereWithoutStoriesInputSchema';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';

export const ProductUncheckedUpdateManyWithoutStoriesNestedInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutStoriesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutStoriesInputSchema),
          z.lazy(() => ProductCreateWithoutStoriesInputSchema).array(),
          z.lazy(() => ProductUncheckedCreateWithoutStoriesInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutStoriesInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductCreateOrConnectWithoutStoriesInputSchema),
          z.lazy(() => ProductCreateOrConnectWithoutStoriesInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => ProductUpsertWithWhereUniqueWithoutStoriesInputSchema),
          z.lazy(() => ProductUpsertWithWhereUniqueWithoutStoriesInputSchema).array(),
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
          z.lazy(() => ProductUpdateWithWhereUniqueWithoutStoriesInputSchema),
          z.lazy(() => ProductUpdateWithWhereUniqueWithoutStoriesInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ProductUpdateManyWithWhereWithoutStoriesInputSchema),
          z.lazy(() => ProductUpdateManyWithWhereWithoutStoriesInputSchema).array(),
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

export default ProductUncheckedUpdateManyWithoutStoriesNestedInputSchema;
