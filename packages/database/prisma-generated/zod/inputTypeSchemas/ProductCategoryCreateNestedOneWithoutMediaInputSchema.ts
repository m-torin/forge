import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryCreateWithoutMediaInputSchema } from './ProductCategoryCreateWithoutMediaInputSchema';
import { ProductCategoryUncheckedCreateWithoutMediaInputSchema } from './ProductCategoryUncheckedCreateWithoutMediaInputSchema';
import { ProductCategoryCreateOrConnectWithoutMediaInputSchema } from './ProductCategoryCreateOrConnectWithoutMediaInputSchema';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';

export const ProductCategoryCreateNestedOneWithoutMediaInputSchema: z.ZodType<Prisma.ProductCategoryCreateNestedOneWithoutMediaInput> = z.object({
  create: z.union([ z.lazy(() => ProductCategoryCreateWithoutMediaInputSchema),z.lazy(() => ProductCategoryUncheckedCreateWithoutMediaInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCategoryCreateOrConnectWithoutMediaInputSchema).optional(),
  connect: z.lazy(() => ProductCategoryWhereUniqueInputSchema).optional()
}).strict();

export default ProductCategoryCreateNestedOneWithoutMediaInputSchema;
