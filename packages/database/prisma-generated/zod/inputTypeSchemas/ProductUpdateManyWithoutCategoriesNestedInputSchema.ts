import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutCategoriesInputSchema } from './ProductCreateWithoutCategoriesInputSchema';
import { ProductUncheckedCreateWithoutCategoriesInputSchema } from './ProductUncheckedCreateWithoutCategoriesInputSchema';
import { ProductCreateOrConnectWithoutCategoriesInputSchema } from './ProductCreateOrConnectWithoutCategoriesInputSchema';
import { ProductUpsertWithWhereUniqueWithoutCategoriesInputSchema } from './ProductUpsertWithWhereUniqueWithoutCategoriesInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithWhereUniqueWithoutCategoriesInputSchema } from './ProductUpdateWithWhereUniqueWithoutCategoriesInputSchema';
import { ProductUpdateManyWithWhereWithoutCategoriesInputSchema } from './ProductUpdateManyWithWhereWithoutCategoriesInputSchema';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';

export const ProductUpdateManyWithoutCategoriesNestedInputSchema: z.ZodType<Prisma.ProductUpdateManyWithoutCategoriesNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutCategoriesInputSchema),z.lazy(() => ProductCreateWithoutCategoriesInputSchema).array(),z.lazy(() => ProductUncheckedCreateWithoutCategoriesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutCategoriesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutCategoriesInputSchema),z.lazy(() => ProductCreateOrConnectWithoutCategoriesInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutCategoriesInputSchema),z.lazy(() => ProductUpsertWithWhereUniqueWithoutCategoriesInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutCategoriesInputSchema),z.lazy(() => ProductUpdateWithWhereUniqueWithoutCategoriesInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutCategoriesInputSchema),z.lazy(() => ProductUpdateManyWithWhereWithoutCategoriesInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema),z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ProductUpdateManyWithoutCategoriesNestedInputSchema;
