import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutInventoryInputSchema } from './ProductCreateWithoutInventoryInputSchema';
import { ProductUncheckedCreateWithoutInventoryInputSchema } from './ProductUncheckedCreateWithoutInventoryInputSchema';
import { ProductCreateOrConnectWithoutInventoryInputSchema } from './ProductCreateOrConnectWithoutInventoryInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedOneWithoutInventoryInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutInventoryInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutInventoryInputSchema),z.lazy(() => ProductUncheckedCreateWithoutInventoryInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutInventoryInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional()
}).strict();

export default ProductCreateNestedOneWithoutInventoryInputSchema;
