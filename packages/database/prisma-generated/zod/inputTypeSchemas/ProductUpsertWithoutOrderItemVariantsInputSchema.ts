import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductUpdateWithoutOrderItemVariantsInputSchema } from './ProductUpdateWithoutOrderItemVariantsInputSchema';
import { ProductUncheckedUpdateWithoutOrderItemVariantsInputSchema } from './ProductUncheckedUpdateWithoutOrderItemVariantsInputSchema';
import { ProductCreateWithoutOrderItemVariantsInputSchema } from './ProductCreateWithoutOrderItemVariantsInputSchema';
import { ProductUncheckedCreateWithoutOrderItemVariantsInputSchema } from './ProductUncheckedCreateWithoutOrderItemVariantsInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';

export const ProductUpsertWithoutOrderItemVariantsInputSchema: z.ZodType<Prisma.ProductUpsertWithoutOrderItemVariantsInput> = z.object({
  update: z.union([ z.lazy(() => ProductUpdateWithoutOrderItemVariantsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutOrderItemVariantsInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCreateWithoutOrderItemVariantsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutOrderItemVariantsInputSchema) ]),
  where: z.lazy(() => ProductWhereInputSchema).optional()
}).strict();

export default ProductUpsertWithoutOrderItemVariantsInputSchema;
