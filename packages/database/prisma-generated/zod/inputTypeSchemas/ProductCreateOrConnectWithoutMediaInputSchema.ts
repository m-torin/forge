import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutMediaInputSchema } from './ProductCreateWithoutMediaInputSchema';
import { ProductUncheckedCreateWithoutMediaInputSchema } from './ProductUncheckedCreateWithoutMediaInputSchema';

export const ProductCreateOrConnectWithoutMediaInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutMediaInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutMediaInputSchema),z.lazy(() => ProductUncheckedCreateWithoutMediaInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutMediaInputSchema;
