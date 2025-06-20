import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutStoriesInputSchema } from './ProductUpdateWithoutStoriesInputSchema';
import { ProductUncheckedUpdateWithoutStoriesInputSchema } from './ProductUncheckedUpdateWithoutStoriesInputSchema';
import { ProductCreateWithoutStoriesInputSchema } from './ProductCreateWithoutStoriesInputSchema';
import { ProductUncheckedCreateWithoutStoriesInputSchema } from './ProductUncheckedCreateWithoutStoriesInputSchema';

export const ProductUpsertWithWhereUniqueWithoutStoriesInputSchema: z.ZodType<Prisma.ProductUpsertWithWhereUniqueWithoutStoriesInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ProductUpdateWithoutStoriesInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutStoriesInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutStoriesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutStoriesInputSchema) ]),
}).strict();

export default ProductUpsertWithWhereUniqueWithoutStoriesInputSchema;
