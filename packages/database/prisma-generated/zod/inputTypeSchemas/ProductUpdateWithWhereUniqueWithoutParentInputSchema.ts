import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutParentInputSchema } from './ProductUpdateWithoutParentInputSchema';
import { ProductUncheckedUpdateWithoutParentInputSchema } from './ProductUncheckedUpdateWithoutParentInputSchema';

export const ProductUpdateWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutParentInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateWithoutParentInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutParentInputSchema) ]),
}).strict();

export default ProductUpdateWithWhereUniqueWithoutParentInputSchema;
