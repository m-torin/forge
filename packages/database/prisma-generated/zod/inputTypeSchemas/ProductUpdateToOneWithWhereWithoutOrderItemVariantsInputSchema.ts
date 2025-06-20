import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductUpdateWithoutOrderItemVariantsInputSchema } from './ProductUpdateWithoutOrderItemVariantsInputSchema';
import { ProductUncheckedUpdateWithoutOrderItemVariantsInputSchema } from './ProductUncheckedUpdateWithoutOrderItemVariantsInputSchema';

export const ProductUpdateToOneWithWhereWithoutOrderItemVariantsInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutOrderItemVariantsInput> = z.object({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutOrderItemVariantsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutOrderItemVariantsInputSchema) ]),
}).strict();

export default ProductUpdateToOneWithWhereWithoutOrderItemVariantsInputSchema;
