import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutChildrenInputSchema } from './ProductCreateWithoutChildrenInputSchema';
import { ProductUncheckedCreateWithoutChildrenInputSchema } from './ProductUncheckedCreateWithoutChildrenInputSchema';

export const ProductCreateOrConnectWithoutChildrenInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutChildrenInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutChildrenInputSchema),z.lazy(() => ProductUncheckedCreateWithoutChildrenInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutChildrenInputSchema;
