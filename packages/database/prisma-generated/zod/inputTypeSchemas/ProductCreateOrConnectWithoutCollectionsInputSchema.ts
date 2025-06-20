import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutCollectionsInputSchema } from './ProductCreateWithoutCollectionsInputSchema';
import { ProductUncheckedCreateWithoutCollectionsInputSchema } from './ProductUncheckedCreateWithoutCollectionsInputSchema';

export const ProductCreateOrConnectWithoutCollectionsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutCollectionsInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutCollectionsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutCollectionsInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutCollectionsInputSchema;
