import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductUpdateWithoutIdentifiersInputSchema } from './ProductUpdateWithoutIdentifiersInputSchema';
import { ProductUncheckedUpdateWithoutIdentifiersInputSchema } from './ProductUncheckedUpdateWithoutIdentifiersInputSchema';

export const ProductUpdateToOneWithWhereWithoutIdentifiersInputSchema: z.ZodType<Prisma.ProductUpdateToOneWithWhereWithoutIdentifiersInput> = z.object({
  where: z.lazy(() => ProductWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ProductUpdateWithoutIdentifiersInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutIdentifiersInputSchema) ]),
}).strict();

export default ProductUpdateToOneWithWhereWithoutIdentifiersInputSchema;
