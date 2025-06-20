import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductUpdateWithoutInventoryInputSchema } from './ProductUpdateWithoutInventoryInputSchema';
import { ProductUncheckedUpdateWithoutInventoryInputSchema } from './ProductUncheckedUpdateWithoutInventoryInputSchema';

export const ProductUpdateToOneWithWhereWithoutInventoryInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutInventoryInput> = z.object({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutInventoryInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutInventoryInputSchema) ]),
}).strict();

export default ProductUpdateToOneWithWhereWithoutInventoryInputSchema;
