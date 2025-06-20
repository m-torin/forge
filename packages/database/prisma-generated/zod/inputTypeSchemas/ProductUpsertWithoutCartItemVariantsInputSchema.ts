import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductUpdateWithoutCartItemVariantsInputSchema } from './ProductUpdateWithoutCartItemVariantsInputSchema';
import { ProductUncheckedUpdateWithoutCartItemVariantsInputSchema } from './ProductUncheckedUpdateWithoutCartItemVariantsInputSchema';
import { ProductCreateWithoutCartItemVariantsInputSchema } from './ProductCreateWithoutCartItemVariantsInputSchema';
import { ProductUncheckedCreateWithoutCartItemVariantsInputSchema } from './ProductUncheckedCreateWithoutCartItemVariantsInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductUpsertWithoutCartItemVariantsInputSchema: z.ZodType<Prisma.ProductUpsertWithoutCartItemVariantsInput> = z.object({
  update: z.union([ z.lazy(() => ProductUpdateWithoutCartItemVariantsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutCartItemVariantsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutCartItemVariantsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutCartItemVariantsInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional()
}).strict();

export default ProductUpsertWithoutCartItemVariantsInputSchema;
