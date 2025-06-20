import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutInventoryVariantsInputSchema } from './ProductCreateWithoutInventoryVariantsInputSchema';
import { ProductUncheckedCreateWithoutInventoryVariantsInputSchema } from './ProductUncheckedCreateWithoutInventoryVariantsInputSchema';
import { ProductCreateOrConnectWithoutInventoryVariantsInputSchema } from './ProductCreateOrConnectWithoutInventoryVariantsInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedOneWithoutInventoryVariantsInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutInventoryVariantsInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutInventoryVariantsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutInventoryVariantsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutInventoryVariantsInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional()
}).strict();

export default ProductCreateNestedOneWithoutInventoryVariantsInputSchema;
