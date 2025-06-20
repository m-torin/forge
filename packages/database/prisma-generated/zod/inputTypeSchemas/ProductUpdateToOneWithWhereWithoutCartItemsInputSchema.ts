import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductUpdateWithoutCartItemsInputSchema } from './ProductUpdateWithoutCartItemsInputSchema';
import { ProductUncheckedUpdateWithoutCartItemsInputSchema } from './ProductUncheckedUpdateWithoutCartItemsInputSchema';

export const ProductUpdateToOneWithWhereWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutCartItemsInput> = z.object({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutCartItemsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutCartItemsInputSchema) ]),
}).strict();

export default ProductUpdateToOneWithWhereWithoutCartItemsInputSchema;
