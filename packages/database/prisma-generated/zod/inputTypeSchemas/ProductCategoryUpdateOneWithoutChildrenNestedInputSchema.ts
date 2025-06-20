import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryCreateWithoutChildrenInputSchema } from './ProductCategoryCreateWithoutChildrenInputSchema';
import { ProductCategoryUncheckedCreateWithoutChildrenInputSchema } from './ProductCategoryUncheckedCreateWithoutChildrenInputSchema';
import { ProductCategoryCreateOrConnectWithoutChildrenInputSchema } from './ProductCategoryCreateOrConnectWithoutChildrenInputSchema';
import { ProductCategoryUpsertWithoutChildrenInputSchema } from './ProductCategoryUpsertWithoutChildrenInputSchema';
import { ProductCategoryWhereInputSchema } from './ProductCategoryWhereInputSchema';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryUpdateToOneWithWhereWithoutChildrenInputSchema } from './ProductCategoryUpdateToOneWithWhereWithoutChildrenInputSchema';
import { ProductCategoryUpdateWithoutChildrenInputSchema } from './ProductCategoryUpdateWithoutChildrenInputSchema';
import { ProductCategoryUncheckedUpdateWithoutChildrenInputSchema } from './ProductCategoryUncheckedUpdateWithoutChildrenInputSchema';

export const ProductCategoryUpdateOneWithoutChildrenNestedInputSchema: z.ZodType<Prisma.ProductCategoryUpdateOneWithoutChildrenNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCategoryCreateWithoutChildrenInputSchema),z.lazy(() => ProductCategoryUncheckedCreateWithoutChildrenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCategoryCreateOrConnectWithoutChildrenInputSchema).optional(),
  upsert: z.lazy(() => ProductCategoryUpsertWithoutChildrenInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ProductCategoryWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ProductCategoryWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ProductCategoryWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductCategoryUpdateToOneWithWhereWithoutChildrenInputSchema),z.lazy(() => ProductCategoryUpdateWithoutChildrenInputSchema),z.lazy(() => ProductCategoryUncheckedUpdateWithoutChildrenInputSchema) ]).optional(),
}).strict();

export default ProductCategoryUpdateOneWithoutChildrenNestedInputSchema;
