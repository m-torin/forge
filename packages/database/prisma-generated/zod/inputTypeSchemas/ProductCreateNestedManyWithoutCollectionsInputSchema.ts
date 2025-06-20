import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutCollectionsInputSchema } from './ProductCreateWithoutCollectionsInputSchema';
import { ProductUncheckedCreateWithoutCollectionsInputSchema } from './ProductUncheckedCreateWithoutCollectionsInputSchema';
import { ProductCreateOrConnectWithoutCollectionsInputSchema } from './ProductCreateOrConnectWithoutCollectionsInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedManyWithoutCollectionsInputSchema: z.ZodType<Prisma.ProductCreateNestedManyWithoutCollectionsInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutCollectionsInputSchema),z.lazy(() => ProductCreateWithoutCollectionsInputSchema).array(),z.lazy(() => ProductUncheckedCreateWithoutCollectionsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutCollectionsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductCreateOrConnectWithoutCollectionsInputSchema),z.lazy(() => ProductCreateOrConnectWithoutCollectionsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ProductWhereUniqueInputSchema),z.lazy(() => ProductWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ProductCreateNestedManyWithoutCollectionsInputSchema;
