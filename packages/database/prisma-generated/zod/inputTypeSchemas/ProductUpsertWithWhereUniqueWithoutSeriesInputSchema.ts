import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutSeriesInputSchema } from './ProductUpdateWithoutSeriesInputSchema';
import { ProductUncheckedUpdateWithoutSeriesInputSchema } from './ProductUncheckedUpdateWithoutSeriesInputSchema';
import { ProductCreateWithoutSeriesInputSchema } from './ProductCreateWithoutSeriesInputSchema';
import { ProductUncheckedCreateWithoutSeriesInputSchema } from './ProductUncheckedCreateWithoutSeriesInputSchema';

export const ProductUpsertWithWhereUniqueWithoutSeriesInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutSeriesInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ProductUpdateWithoutSeriesInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutSeriesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutSeriesInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutSeriesInputSchema),
      ]),
    })
    .strict();

export default ProductUpsertWithWhereUniqueWithoutSeriesInputSchema;
