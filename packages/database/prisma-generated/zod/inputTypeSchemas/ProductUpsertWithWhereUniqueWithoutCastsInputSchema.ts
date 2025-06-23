import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutCastsInputSchema } from './ProductUpdateWithoutCastsInputSchema';
import { ProductUncheckedUpdateWithoutCastsInputSchema } from './ProductUncheckedUpdateWithoutCastsInputSchema';
import { ProductCreateWithoutCastsInputSchema } from './ProductCreateWithoutCastsInputSchema';
import { ProductUncheckedCreateWithoutCastsInputSchema } from './ProductUncheckedCreateWithoutCastsInputSchema';

export const ProductUpsertWithWhereUniqueWithoutCastsInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutCastsInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ProductUpdateWithoutCastsInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutCastsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutCastsInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutCastsInputSchema),
      ]),
    })
    .strict();

export default ProductUpsertWithWhereUniqueWithoutCastsInputSchema;
