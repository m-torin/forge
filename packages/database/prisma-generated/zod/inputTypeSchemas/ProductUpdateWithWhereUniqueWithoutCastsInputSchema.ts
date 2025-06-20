import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutCastsInputSchema } from './ProductUpdateWithoutCastsInputSchema';
import { ProductUncheckedUpdateWithoutCastsInputSchema } from './ProductUncheckedUpdateWithoutCastsInputSchema';

export const ProductUpdateWithWhereUniqueWithoutCastsInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutCastsInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateWithoutCastsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutCastsInputSchema) ]),
}).strict();

export default ProductUpdateWithWhereUniqueWithoutCastsInputSchema;
