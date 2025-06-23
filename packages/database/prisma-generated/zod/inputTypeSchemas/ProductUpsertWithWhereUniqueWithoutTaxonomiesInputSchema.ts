import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutTaxonomiesInputSchema } from './ProductUpdateWithoutTaxonomiesInputSchema';
import { ProductUncheckedUpdateWithoutTaxonomiesInputSchema } from './ProductUncheckedUpdateWithoutTaxonomiesInputSchema';
import { ProductCreateWithoutTaxonomiesInputSchema } from './ProductCreateWithoutTaxonomiesInputSchema';
import { ProductUncheckedCreateWithoutTaxonomiesInputSchema } from './ProductUncheckedCreateWithoutTaxonomiesInputSchema';

export const ProductUpsertWithWhereUniqueWithoutTaxonomiesInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutTaxonomiesInput> =
  z
    .object({
      where: z.lazy(() => ProductWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => ProductUpdateWithoutTaxonomiesInputSchema),
        z.lazy(() => ProductUncheckedUpdateWithoutTaxonomiesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => ProductCreateWithoutTaxonomiesInputSchema),
        z.lazy(() => ProductUncheckedCreateWithoutTaxonomiesInputSchema),
      ]),
    })
    .strict();

export default ProductUpsertWithWhereUniqueWithoutTaxonomiesInputSchema;
