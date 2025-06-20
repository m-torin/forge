import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductUpdateWithoutOrderItemsInputSchema } from './ProductUpdateWithoutOrderItemsInputSchema';
import { ProductUncheckedUpdateWithoutOrderItemsInputSchema } from './ProductUncheckedUpdateWithoutOrderItemsInputSchema';

export const ProductUpdateToOneWithWhereWithoutOrderItemsInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutOrderItemsInput> = z.object({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutOrderItemsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutOrderItemsInputSchema) ]),
}).strict();

export default ProductUpdateToOneWithWhereWithoutOrderItemsInputSchema;
