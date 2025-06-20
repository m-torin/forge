import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryCreateWithoutMediaInputSchema } from './ProductCategoryCreateWithoutMediaInputSchema';
import { ProductCategoryUncheckedCreateWithoutMediaInputSchema } from './ProductCategoryUncheckedCreateWithoutMediaInputSchema';
import { ProductCategoryCreateOrConnectWithoutMediaInputSchema } from './ProductCategoryCreateOrConnectWithoutMediaInputSchema';
import { ProductCategoryUpsertWithoutMediaInputSchema } from './ProductCategoryUpsertWithoutMediaInputSchema';
import { ProductCategoryWhereInputSchema } from './ProductCategoryWhereInputSchema';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryUpdateToOneWithWhereWithoutMediaInputSchema } from './ProductCategoryUpdateToOneWithWhereWithoutMediaInputSchema';
import { ProductCategoryUpdateWithoutMediaInputSchema } from './ProductCategoryUpdateWithoutMediaInputSchema';
import { ProductCategoryUncheckedUpdateWithoutMediaInputSchema } from './ProductCategoryUncheckedUpdateWithoutMediaInputSchema';

export const ProductCategoryUpdateOneWithoutMediaNestedInputSchema: z.ZodType<Prisma.ProductCategoryUpdateOneWithoutMediaNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCategoryCreateWithoutMediaInputSchema),z.lazy(() => ProductCategoryUncheckedCreateWithoutMediaInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCategoryCreateOrConnectWithoutMediaInputSchema).optional(),
  upsert: z.lazy(() => ProductCategoryUpsertWithoutMediaInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ProductCategoryWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ProductCategoryWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ProductCategoryWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductCategoryUpdateToOneWithWhereWithoutMediaInputSchema),z.lazy(() => ProductCategoryUpdateWithoutMediaInputSchema),z.lazy(() => ProductCategoryUncheckedUpdateWithoutMediaInputSchema) ]).optional(),
}).strict();

export default ProductCategoryUpdateOneWithoutMediaNestedInputSchema;
