import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryCreateWithoutProductsInputSchema } from './ProductCategoryCreateWithoutProductsInputSchema';
import { ProductCategoryUncheckedCreateWithoutProductsInputSchema } from './ProductCategoryUncheckedCreateWithoutProductsInputSchema';
import { ProductCategoryCreateOrConnectWithoutProductsInputSchema } from './ProductCategoryCreateOrConnectWithoutProductsInputSchema';
import { ProductCategoryUpsertWithWhereUniqueWithoutProductsInputSchema } from './ProductCategoryUpsertWithWhereUniqueWithoutProductsInputSchema';
import { ProductCategoryWhereUniqueInputSchema } from './ProductCategoryWhereUniqueInputSchema';
import { ProductCategoryUpdateWithWhereUniqueWithoutProductsInputSchema } from './ProductCategoryUpdateWithWhereUniqueWithoutProductsInputSchema';
import { ProductCategoryUpdateManyWithWhereWithoutProductsInputSchema } from './ProductCategoryUpdateManyWithWhereWithoutProductsInputSchema';
import { ProductCategoryScalarWhereInputSchema } from './ProductCategoryScalarWhereInputSchema';

export const ProductCategoryUpdateManyWithoutProductsNestedInputSchema: z.ZodType<Prisma.ProductCategoryUpdateManyWithoutProductsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCategoryCreateWithoutProductsInputSchema),z.lazy(() => ProductCategoryCreateWithoutProductsInputSchema).array(),z.lazy(() => ProductCategoryUncheckedCreateWithoutProductsInputSchema),z.lazy(() => ProductCategoryUncheckedCreateWithoutProductsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCategoryCreateOrConnectWithoutProductsInputSchema),z.lazy(() => ProductCategoryCreateOrConnectWithoutProductsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductCategoryUpsertWithWhereUniqueWithoutProductsInputSchema),z.lazy(() => ProductCategoryUpsertWithWhereUniqueWithoutProductsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => ProductCategoryWhereUniqueInputSchema),z.lazy(() => ProductCategoryWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductCategoryWhereUniqueInputSchema),z.lazy(() => ProductCategoryWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductCategoryWhereUniqueInputSchema),z.lazy(() => ProductCategoryWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductCategoryWhereUniqueInputSchema),z.lazy(() => ProductCategoryWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductCategoryUpdateWithWhereUniqueWithoutProductsInputSchema),z.lazy(() => ProductCategoryUpdateWithWhereUniqueWithoutProductsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductCategoryUpdateManyWithWhereWithoutProductsInputSchema),z.lazy(() => ProductCategoryUpdateManyWithWhereWithoutProductsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductCategoryScalarWhereInputSchema),z.lazy(() => ProductCategoryScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ProductCategoryUpdateManyWithoutProductsNestedInputSchema;
