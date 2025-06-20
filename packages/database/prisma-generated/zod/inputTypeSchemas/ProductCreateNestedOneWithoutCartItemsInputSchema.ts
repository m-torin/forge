import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutCartItemsInputSchema } from './ProductCreateWithoutCartItemsInputSchema';
import { ProductUncheckedCreateWithoutCartItemsInputSchema } from './ProductUncheckedCreateWithoutCartItemsInputSchema';
import { ProductCreateOrConnectWithoutCartItemsInputSchema } from './ProductCreateOrConnectWithoutCartItemsInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedOneWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutCartItemsInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutCartItemsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutCartItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutCartItemsInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional()
}).strict();

export default ProductCreateNestedOneWithoutCartItemsInputSchema;
