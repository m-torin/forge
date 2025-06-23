import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutSeriesInputSchema } from './ProductCreateWithoutSeriesInputSchema';
import { ProductUncheckedCreateWithoutSeriesInputSchema } from './ProductUncheckedCreateWithoutSeriesInputSchema';
import { ProductCreateOrConnectWithoutSeriesInputSchema } from './ProductCreateOrConnectWithoutSeriesInputSchema';
import { ProductUpsertWithWhereUniqueWithoutSeriesInputSchema } from './ProductUpsertWithWhereUniqueWithoutSeriesInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithWhereUniqueWithoutSeriesInputSchema } from './ProductUpdateWithWhereUniqueWithoutSeriesInputSchema';
import { ProductUpdateManyWithWhereWithoutSeriesInputSchema } from './ProductUpdateManyWithWhereWithoutSeriesInputSchema';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';

export const ProductUpdateManyWithoutSeriesNestedInputSchema: z.ZodType<Prisma.ProductUpdateManyWithoutSeriesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutSeriesInputSchema),
          z.lazy(() => ProductCreateWithoutSeriesInputSchema).array(),
          z.lazy(() => ProductUncheckedCreateWithoutSeriesInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutSeriesInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductCreateOrConnectWithoutSeriesInputSchema),
          z.lazy(() => ProductCreateOrConnectWithoutSeriesInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => ProductUpsertWithWhereUniqueWithoutSeriesInputSchema),
          z.lazy(() => ProductUpsertWithWhereUniqueWithoutSeriesInputSchema).array(),
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
          z.lazy(() => ProductUpdateWithWhereUniqueWithoutSeriesInputSchema),
          z.lazy(() => ProductUpdateWithWhereUniqueWithoutSeriesInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ProductUpdateManyWithWhereWithoutSeriesInputSchema),
          z.lazy(() => ProductUpdateManyWithWhereWithoutSeriesInputSchema).array(),
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

export default ProductUpdateManyWithoutSeriesNestedInputSchema;
