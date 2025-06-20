import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutStoriesInputSchema } from './ProductUpdateWithoutStoriesInputSchema';
import { ProductUncheckedUpdateWithoutStoriesInputSchema } from './ProductUncheckedUpdateWithoutStoriesInputSchema';

export const ProductUpdateWithWhereUniqueWithoutStoriesInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutStoriesInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateWithoutStoriesInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutStoriesInputSchema) ]),
}).strict();

export default ProductUpdateWithWhereUniqueWithoutStoriesInputSchema;
