import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithoutSeriesInputSchema } from './ProductUpdateWithoutSeriesInputSchema';
import { ProductUncheckedUpdateWithoutSeriesInputSchema } from './ProductUncheckedUpdateWithoutSeriesInputSchema';

export const ProductUpdateWithWhereUniqueWithoutSeriesInputSchema: z.ZodType<Prisma.ProductUpdateWithWhereUniqueWithoutSeriesInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateWithoutSeriesInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutSeriesInputSchema) ]),
}).strict();

export default ProductUpdateWithWhereUniqueWithoutSeriesInputSchema;
