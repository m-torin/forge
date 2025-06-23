import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';
import { ProductUpdateManyMutationInputSchema } from './ProductUpdateManyMutationInputSchema';
import { ProductUncheckedUpdateManyWithoutTaxonomiesInputSchema } from './ProductUncheckedUpdateManyWithoutTaxonomiesInputSchema';

export const ProductUpdateManyWithWhereWithoutTaxonomiesInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutTaxonomiesInput> =
  z
    .object({
      where: z.lazy(() => ProductScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => ProductUpdateManyMutationInputSchema),
        z.lazy(() => ProductUncheckedUpdateManyWithoutTaxonomiesInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateManyWithWhereWithoutTaxonomiesInputSchema;
