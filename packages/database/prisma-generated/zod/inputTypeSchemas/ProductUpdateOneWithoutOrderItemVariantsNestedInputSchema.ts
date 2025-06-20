import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutOrderItemVariantsInputSchema } from './ProductCreateWithoutOrderItemVariantsInputSchema';
import { ProductUncheckedCreateWithoutOrderItemVariantsInputSchema } from './ProductUncheckedCreateWithoutOrderItemVariantsInputSchema';
import { ProductCreateOrConnectWithoutOrderItemVariantsInputSchema } from './ProductCreateOrConnectWithoutOrderItemVariantsInputSchema';
import { ProductUpsertWithoutOrderItemVariantsInputSchema } from './ProductUpsertWithoutOrderItemVariantsInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateToOneWithWhereWithoutOrderItemVariantsInputSchema } from './ProductUpdateToOneWithWhereWithoutOrderItemVariantsInputSchema';
import { ProductUpdateWithoutOrderItemVariantsInputSchema } from './ProductUpdateWithoutOrderItemVariantsInputSchema';
import { ProductUncheckedUpdateWithoutOrderItemVariantsInputSchema } from './ProductUncheckedUpdateWithoutOrderItemVariantsInputSchema';

export const ProductUpdateOneWithoutOrderItemVariantsNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneWithoutOrderItemVariantsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutOrderItemVariantsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutOrderItemVariantsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutOrderItemVariantsInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutOrderItemVariantsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutOrderItemVariantsInputSchema),z.lazy(() => ProductUpdateWithoutOrderItemVariantsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutOrderItemVariantsInputSchema) ]).optional(),
}).strict();

export default ProductUpdateOneWithoutOrderItemVariantsNestedInputSchema;
