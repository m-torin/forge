import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';
import { ProductUpdateManyMutationInputSchema } from './ProductUpdateManyMutationInputSchema';
import { ProductUncheckedUpdateManyWithoutSeriesInputSchema } from './ProductUncheckedUpdateManyWithoutSeriesInputSchema';

export const ProductUpdateManyWithWhereWithoutSeriesInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutSeriesInput> = z.object({
  where: z.lazy(() => ProductScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateManyMutationInputSchema),z.lazy(() => ProductUncheckedUpdateManyWithoutSeriesInputSchema) ]),
}).strict();

export default ProductUpdateManyWithWhereWithoutSeriesInputSchema;
