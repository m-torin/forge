import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutInventoryInputSchema } from './ProductCreateWithoutInventoryInputSchema';
import { ProductUncheckedCreateWithoutInventoryInputSchema } from './ProductUncheckedCreateWithoutInventoryInputSchema';

export const ProductCreateOrConnectWithoutInventoryInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutInventoryInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutInventoryInputSchema),z.lazy(() => ProductUncheckedCreateWithoutInventoryInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutInventoryInputSchema;
