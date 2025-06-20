import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductUpdateWithoutInventoryInputSchema } from './ProductUpdateWithoutInventoryInputSchema';
import { ProductUncheckedUpdateWithoutInventoryInputSchema } from './ProductUncheckedUpdateWithoutInventoryInputSchema';
import { ProductCreateWithoutInventoryInputSchema } from './ProductCreateWithoutInventoryInputSchema';
import { ProductUncheckedCreateWithoutInventoryInputSchema } from './ProductUncheckedCreateWithoutInventoryInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductUpsertWithoutInventoryInputSchema: z.ZodType<Prisma.ProductUpsertWithoutInventoryInput> = z.object({
  update: z.union([ z.lazy(() => ProductUpdateWithoutInventoryInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutInventoryInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutInventoryInputSchema),z.lazy(() => ProductUncheckedCreateWithoutInventoryInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional()
}).strict();

export default ProductUpsertWithoutInventoryInputSchema;
