import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutStoriesInputSchema } from './ProductCreateWithoutStoriesInputSchema';
import { ProductUncheckedCreateWithoutStoriesInputSchema } from './ProductUncheckedCreateWithoutStoriesInputSchema';

export const ProductCreateOrConnectWithoutStoriesInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutStoriesInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutStoriesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutStoriesInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutStoriesInputSchema;
