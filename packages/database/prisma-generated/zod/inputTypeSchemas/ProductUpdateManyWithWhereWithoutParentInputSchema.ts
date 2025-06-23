import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';
import { ProductUpdateManyMutationInputSchema } from './ProductUpdateManyMutationInputSchema';
import { ProductUncheckedUpdateManyWithoutParentInputSchema } from './ProductUncheckedUpdateManyWithoutParentInputSchema';

export const ProductUpdateManyWithWhereWithoutParentInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutParentInput> =
  z
    .object({
      where: z.lazy(() => ProductScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => ProductUpdateManyMutationInputSchema),
        z.lazy(() => ProductUncheckedUpdateManyWithoutParentInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateManyWithWhereWithoutParentInputSchema;
