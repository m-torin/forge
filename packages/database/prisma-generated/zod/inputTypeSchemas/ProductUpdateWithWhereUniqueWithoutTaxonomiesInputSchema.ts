import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutTaxonomiesInputSchema } from './ProductUpdateWithoutTaxonomiesInputSchema';
import { ProductUncheckedUpdateWithoutTaxonomiesInputSchema } from './ProductUncheckedUpdateWithoutTaxonomiesInputSchema';

export const ProductUpdateWithWhereUniqueWithoutTaxonomiesInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutTaxonomiesInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => ProductUpdateWithoutTaxonomiesInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutTaxonomiesInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateWithWhereUniqueWithoutTaxonomiesInputSchema;
