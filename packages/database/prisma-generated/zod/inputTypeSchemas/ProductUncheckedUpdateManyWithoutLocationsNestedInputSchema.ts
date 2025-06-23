import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutLocationsInputSchema } from './ProductCreateWithoutLocationsInputSchema';
import { ProductUncheckedCreateWithoutLocationsInputSchema } from './ProductUncheckedCreateWithoutLocationsInputSchema';
import { ProductCreateOrConnectWithoutLocationsInputSchema } from './ProductCreateOrConnectWithoutLocationsInputSchema';
import { ProductUpsertWithWhereUniqueWithoutLocationsInputSchema } from './ProductUpsertWithWhereUniqueWithoutLocationsInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithWhereUniqueWithoutLocationsInputSchema } from './ProductUpdateWithWhereUniqueWithoutLocationsInputSchema';
import { ProductUpdateManyWithWhereWithoutLocationsInputSchema } from './ProductUpdateManyWithWhereWithoutLocationsInputSchema';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';

export const ProductUncheckedUpdateManyWithoutLocationsNestedInputSchema: z.ZodType<Prisma.ProductUncheckedUpdateManyWithoutLocationsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutLocationsInputSchema),
          z.lazy(() => ProductCreateWithoutLocationsInputSchema).array(),
          z.lazy(() => ProductUncheckedCreateWithoutLocationsInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutLocationsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductCreateOrConnectWithoutLocationsInputSchema),
          z.lazy(() => ProductCreateOrConnectWithoutLocationsInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => ProductUpsertWithWhereUniqueWithoutLocationsInputSchema),
          z.lazy(() => ProductUpsertWithWhereUniqueWithoutLocationsInputSchema).array(),
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
          z.lazy(() => ProductUpdateWithWhereUniqueWithoutLocationsInputSchema),
          z.lazy(() => ProductUpdateWithWhereUniqueWithoutLocationsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ProductUpdateManyWithWhereWithoutLocationsInputSchema),
          z.lazy(() => ProductUpdateManyWithWhereWithoutLocationsInputSchema).array(),
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

export default ProductUncheckedUpdateManyWithoutLocationsNestedInputSchema;
