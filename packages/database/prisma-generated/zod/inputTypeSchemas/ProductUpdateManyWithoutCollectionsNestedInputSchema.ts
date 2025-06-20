import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutCollectionsInputSchema } from './ProductCreateWithoutCollectionsInputSchema';
import { ProductUncheckedCreateWithoutCollectionsInputSchema } from './ProductUncheckedCreateWithoutCollectionsInputSchema';
import { ProductCreateOrConnectWithoutCollectionsInputSchema } from './ProductCreateOrConnectWithoutCollectionsInputSchema';
import { ProductUpsertWithWhereUniqueWithoutCollectionsInputSchema } from './ProductUpsertWithWhereUniqueWithoutCollectionsInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateWithWhereUniqueWithoutCollectionsInputSchema } from './ProductUpdateWithWhereUniqueWithoutCollectionsInputSchema';
import { ProductUpdateManyWithWhereWithoutCollectionsInputSchema } from './ProductUpdateManyWithWhereWithoutCollectionsInputSchema';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';

export const ProductUpdateManyWithoutCollectionsNestedInputSchema: z.ZodType<Prisma.ProductUpdateManyWithoutCollectionsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutCollectionsInputSchema),z.lazy(() => ProductCreateWithoutCollectionsInputSchema).array(),z.lazy(() => ProductUncheckedCreateWithoutCollectionsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutCollectionsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutCollectionsInputSchema),z.lazy(() => ProductCreateOrConnectWithoutCollectionsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ProductUpsertWithWhereUniqueWithoutCollectionsInputSchema),z.lazy(() => ProductUpsertWithWhereUniqueWithoutCollectionsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ProductUpdateWithWhereUniqueWithoutCollectionsInputSchema),z.lazy(() => ProductUpdateWithWhereUniqueWithoutCollectionsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ProductUpdateManyWithWhereWithoutCollectionsInputSchema),z.lazy(() => ProductUpdateManyWithWhereWithoutCollectionsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ProductScalarWhereInputSchema),z.lazy(() => ProductScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default ProductUpdateManyWithoutCollectionsNestedInputSchema;
