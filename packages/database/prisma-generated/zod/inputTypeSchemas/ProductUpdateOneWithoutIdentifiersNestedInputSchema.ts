import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutIdentifiersInputSchema } from './ProductCreateWithoutIdentifiersInputSchema';
import { ProductUncheckedCreateWithoutIdentifiersInputSchema } from './ProductUncheckedCreateWithoutIdentifiersInputSchema';
import { ProductCreateOrConnectWithoutIdentifiersInputSchema } from './ProductCreateOrConnectWithoutIdentifiersInputSchema';
import { ProductUpsertWithoutIdentifiersInputSchema } from './ProductUpsertWithoutIdentifiersInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateToOneWithWhereWithoutIdentifiersInputSchema } from './ProductUpdateToOneWithWhereWithoutIdentifiersInputSchema';
import { ProductUpdateWithoutIdentifiersInputSchema } from './ProductUpdateWithoutIdentifiersInputSchema';
import { ProductUncheckedUpdateWithoutIdentifiersInputSchema } from './ProductUncheckedUpdateWithoutIdentifiersInputSchema';

export const ProductUpdateOneWithoutIdentifiersNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneWithoutIdentifiersNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutIdentifiersInputSchema),z.lazy(() => ProductUncheckedCreateWithoutIdentifiersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutIdentifiersInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutIdentifiersInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutIdentifiersInputSchema),z.lazy(() => ProductUpdateWithoutIdentifiersInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutIdentifiersInputSchema) ]).optional(),
}).strict();

export default ProductUpdateOneWithoutIdentifiersNestedInputSchema;
