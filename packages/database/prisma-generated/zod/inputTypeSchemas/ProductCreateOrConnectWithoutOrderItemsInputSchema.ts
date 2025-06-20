import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutOrderItemsInputSchema } from './ProductCreateWithoutOrderItemsInputSchema';
import { ProductUncheckedCreateWithoutOrderItemsInputSchema } from './ProductUncheckedCreateWithoutOrderItemsInputSchema';

export const ProductCreateOrConnectWithoutOrderItemsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutOrderItemsInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutOrderItemsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutOrderItemsInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutOrderItemsInputSchema;
