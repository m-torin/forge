import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductUpdateWithoutCartItemsInputSchema } from './ProductUpdateWithoutCartItemsInputSchema';
import { ProductUncheckedUpdateWithoutCartItemsInputSchema } from './ProductUncheckedUpdateWithoutCartItemsInputSchema';
import { ProductCreateWithoutCartItemsInputSchema } from './ProductCreateWithoutCartItemsInputSchema';
import { ProductUncheckedCreateWithoutCartItemsInputSchema } from './ProductUncheckedCreateWithoutCartItemsInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductUpsertWithoutCartItemsInputSchema: z.ZodType<Prisma.ProductUpsertWithoutCartItemsInput> = z.object({
  update: z.union([ z.lazy(() => ProductUpdateWithoutCartItemsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutCartItemsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutCartItemsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutCartItemsInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional()
}).strict();

export default ProductUpsertWithoutCartItemsInputSchema;
