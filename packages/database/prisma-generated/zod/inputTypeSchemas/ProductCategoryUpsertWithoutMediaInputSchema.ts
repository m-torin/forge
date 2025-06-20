import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryUpdateWithoutMediaInputSchema } from './ProductCategoryUpdateWithoutMediaInputSchema';
import { ProductCategoryUncheckedUpdateWithoutMediaInputSchema } from './ProductCategoryUncheckedUpdateWithoutMediaInputSchema';
import { ProductCategoryCreateWithoutMediaInputSchema } from './ProductCategoryCreateWithoutMediaInputSchema';
import { ProductCategoryUncheckedCreateWithoutMediaInputSchema } from './ProductCategoryUncheckedCreateWithoutMediaInputSchema';
import { ProductCategoryWhereInputSchema } from './ProductCategoryWhereInputSchema';

export const ProductCategoryUpsertWithoutMediaInputSchema: z.ZodType<Prisma.ProductCategoryUpsertWithoutMediaInput> = z.object({
  update: z.union([ z.lazy(() => ProductCategoryUpdateWithoutMediaInputSchema),z.lazy(() => ProductCategoryUncheckedUpdateWithoutMediaInputSchema) ]),
  create: z.union([ z.lazy(() => ProductCategoryCreateWithoutMediaInputSchema),z.lazy(() => ProductCategoryUncheckedCreateWithoutMediaInputSchema) ]),
  where: z.lazy(() => ProductCategoryWhereInputSchema).optional()
}).strict();

export default ProductCategoryUpsertWithoutMediaInputSchema;
