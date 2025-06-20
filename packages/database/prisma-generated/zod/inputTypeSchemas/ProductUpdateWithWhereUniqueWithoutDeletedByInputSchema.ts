import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutDeletedByInputSchema } from './ProductUpdateWithoutDeletedByInputSchema';
import { ProductUncheckedUpdateWithoutDeletedByInputSchema } from './ProductUncheckedUpdateWithoutDeletedByInputSchema';

export const ProductUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutDeletedByInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateWithoutDeletedByInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutDeletedByInputSchema) ]),
}).strict();

export default ProductUpdateWithWhereUniqueWithoutDeletedByInputSchema;
