import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutSeriesInputSchema } from './ProductCreateWithoutSeriesInputSchema';
import { ProductUncheckedCreateWithoutSeriesInputSchema } from './ProductUncheckedCreateWithoutSeriesInputSchema';
import { ProductCreateOrConnectWithoutSeriesInputSchema } from './ProductCreateOrConnectWithoutSeriesInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedManyWithoutSeriesInputSchema: z.ZodType<Prisma.ProductCreateNestedManyWithoutSeriesInput> =
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
      connect: z
        .union([
          z.lazy(() => ProductWhereUniqueInputSchema),
          z.lazy(() => ProductWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ProductCreateNestedManyWithoutSeriesInputSchema;
