import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';
import { ProductUpdateManyMutationInputSchema } from './ProductUpdateManyMutationInputSchema';
import { ProductUncheckedUpdateManyWithoutStoriesInputSchema } from './ProductUncheckedUpdateManyWithoutStoriesInputSchema';

export const ProductUpdateManyWithWhereWithoutStoriesInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutStoriesInput> =
  z
    .object({
      where: z.lazy(() => ProductScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => ProductUpdateManyMutationInputSchema),
        z.lazy(() => ProductUncheckedUpdateManyWithoutStoriesInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateManyWithWhereWithoutStoriesInputSchema;
