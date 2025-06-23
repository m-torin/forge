import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutCollectionsInputSchema } from './ProductUpdateWithoutCollectionsInputSchema';
import { ProductUncheckedUpdateWithoutCollectionsInputSchema } from './ProductUncheckedUpdateWithoutCollectionsInputSchema';

export const ProductUpdateWithWhereUniqueWithoutCollectionsInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutCollectionsInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => ProductUpdateWithoutCollectionsInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutCollectionsInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateWithWhereUniqueWithoutCollectionsInputSchema;
