import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutChildrenInputSchema } from './ProductCreateWithoutChildrenInputSchema';
import { ProductUncheckedCreateWithoutChildrenInputSchema } from './ProductUncheckedCreateWithoutChildrenInputSchema';
import { ProductCreateOrConnectWithoutChildrenInputSchema } from './ProductCreateOrConnectWithoutChildrenInputSchema';
import { ProductUpsertWithoutChildrenInputSchema } from './ProductUpsertWithoutChildrenInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateToOneWithWhereWithoutChildrenInputSchema } from './ProductUpdateToOneWithWhereWithoutChildrenInputSchema';
import { ProductUpdateWithoutChildrenInputSchema } from './ProductUpdateWithoutChildrenInputSchema';
import { ProductUncheckedUpdateWithoutChildrenInputSchema } from './ProductUncheckedUpdateWithoutChildrenInputSchema';

export const ProductUpdateOneWithoutChildrenNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneWithoutChildrenNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutChildrenInputSchema),z.lazy(() => ProductUncheckedCreateWithoutChildrenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutChildrenInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutChildrenInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutChildrenInputSchema),z.lazy(() => ProductUpdateWithoutChildrenInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutChildrenInputSchema) ]).optional(),
}).strict();

export default ProductUpdateOneWithoutChildrenNestedInputSchema;
