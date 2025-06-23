import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutRegistriesInputSchema } from './ProductCreateWithoutRegistriesInputSchema';
import { ProductUncheckedCreateWithoutRegistriesInputSchema } from './ProductUncheckedCreateWithoutRegistriesInputSchema';
import { ProductCreateOrConnectWithoutRegistriesInputSchema } from './ProductCreateOrConnectWithoutRegistriesInputSchema';
import { ProductUpsertWithoutRegistriesInputSchema } from './ProductUpsertWithoutRegistriesInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateToOneWithWhereWithoutRegistriesInputSchema } from './ProductUpdateToOneWithWhereWithoutRegistriesInputSchema';
import { ProductUpdateWithoutRegistriesInputSchema } from './ProductUpdateWithoutRegistriesInputSchema';
import { ProductUncheckedUpdateWithoutRegistriesInputSchema } from './ProductUncheckedUpdateWithoutRegistriesInputSchema';

export const ProductUpdateOneWithoutRegistriesNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneWithoutRegistriesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductCreateWithoutRegistriesInputSchema),
          z.lazy(() => ProductUncheckedCreateWithoutRegistriesInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutRegistriesInputSchema).optional(),
      upsert: z.lazy(() => ProductUpsertWithoutRegistriesInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => ProductWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => ProductWhereInputSchema)]).optional(),
      connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => ProductUpdateToOneWithWhereWithoutRegistriesInputSchema),
          z.lazy(() => ProductUpdateWithoutRegistriesInputSchema),
          z.lazy(() => ProductUncheckedUpdateWithoutRegistriesInputSchema),
        ])
        .optional(),
    })
    .strict();

export default ProductUpdateOneWithoutRegistriesNestedInputSchema;
