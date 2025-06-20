import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductUpdateWithoutMediaInputSchema } from './ProductUpdateWithoutMediaInputSchema';
import { ProductUncheckedUpdateWithoutMediaInputSchema } from './ProductUncheckedUpdateWithoutMediaInputSchema';

export const ProductUpdateToOneWithWhereWithoutMediaInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutMediaInput> = z.object({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutMediaInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutMediaInputSchema) ]),
}).strict();

export default ProductUpdateToOneWithWhereWithoutMediaInputSchema;
