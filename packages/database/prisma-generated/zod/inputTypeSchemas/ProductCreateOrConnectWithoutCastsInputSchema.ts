import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutCastsInputSchema } from './ProductCreateWithoutCastsInputSchema';
import { ProductUncheckedCreateWithoutCastsInputSchema } from './ProductUncheckedCreateWithoutCastsInputSchema';

export const ProductCreateOrConnectWithoutCastsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutCastsInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutCastsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutCastsInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutCastsInputSchema;
