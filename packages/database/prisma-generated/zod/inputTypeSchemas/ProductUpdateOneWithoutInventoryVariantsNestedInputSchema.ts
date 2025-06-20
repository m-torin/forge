import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutInventoryVariantsInputSchema } from './ProductCreateWithoutInventoryVariantsInputSchema';
import { ProductUncheckedCreateWithoutInventoryVariantsInputSchema } from './ProductUncheckedCreateWithoutInventoryVariantsInputSchema';
import { ProductCreateOrConnectWithoutInventoryVariantsInputSchema } from './ProductCreateOrConnectWithoutInventoryVariantsInputSchema';
import { ProductUpsertWithoutInventoryVariantsInputSchema } from './ProductUpsertWithoutInventoryVariantsInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateToOneWithWhereWithoutInventoryVariantsInputSchema } from './ProductUpdateToOneWithWhereWithoutInventoryVariantsInputSchema';
import { ProductUpdateWithoutInventoryVariantsInputSchema } from './ProductUpdateWithoutInventoryVariantsInputSchema';
import { ProductUncheckedUpdateWithoutInventoryVariantsInputSchema } from './ProductUncheckedUpdateWithoutInventoryVariantsInputSchema';

export const ProductUpdateOneWithoutInventoryVariantsNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneWithoutInventoryVariantsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutInventoryVariantsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutInventoryVariantsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutInventoryVariantsInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutInventoryVariantsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutInventoryVariantsInputSchema),z.lazy(() => ProductUpdateWithoutInventoryVariantsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutInventoryVariantsInputSchema) ]).optional(),
}).strict();

export default ProductUpdateOneWithoutInventoryVariantsNestedInputSchema;
