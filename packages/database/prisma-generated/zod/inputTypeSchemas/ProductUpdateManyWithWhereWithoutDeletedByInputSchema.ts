import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';
import { ProductUpdateManyMutationInputSchema } from './ProductUpdateManyMutationInputSchema';
import { ProductUncheckedUpdateManyWithoutDeletedByInputSchema } from './ProductUncheckedUpdateManyWithoutDeletedByInputSchema';

export const ProductUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => ProductScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => ProductUpdateManyMutationInputSchema),
        z.lazy(() => ProductUncheckedUpdateManyWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateManyWithWhereWithoutDeletedByInputSchema;
