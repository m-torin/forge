import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutCollectionsInputSchema } from './ProductUpdateWithoutCollectionsInputSchema';
import { ProductUncheckedUpdateWithoutCollectionsInputSchema } from './ProductUncheckedUpdateWithoutCollectionsInputSchema';
import { ProductCreateWithoutCollectionsInputSchema } from './ProductCreateWithoutCollectionsInputSchema';
import { ProductUncheckedCreateWithoutCollectionsInputSchema } from './ProductUncheckedCreateWithoutCollectionsInputSchema';

export const ProductUpsertWithWhereUniqueWithoutCollectionsInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutCollectionsInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ProductUpdateWithoutCollectionsInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutCollectionsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutCollectionsInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutCollectionsInputSchema),
      ]),
    })
    .strict();

export default ProductUpsertWithWhereUniqueWithoutCollectionsInputSchema;
