import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutIdentifiersInputSchema } from './ProductCreateWithoutIdentifiersInputSchema';
import { ProductUncheckedCreateWithoutIdentifiersInputSchema } from './ProductUncheckedCreateWithoutIdentifiersInputSchema';

export const ProductCreateOrConnectWithoutIdentifiersInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutIdentifiersInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutIdentifiersInputSchema),z.lazy(() => ProductUncheckedCreateWithoutIdentifiersInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutIdentifiersInputSchema;
