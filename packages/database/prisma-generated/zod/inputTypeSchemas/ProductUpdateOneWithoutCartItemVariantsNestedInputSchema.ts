import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutCartItemVariantsInputSchema } from './ProductCreateWithoutCartItemVariantsInputSchema';
import { ProductUncheckedCreateWithoutCartItemVariantsInputSchema } from './ProductUncheckedCreateWithoutCartItemVariantsInputSchema';
import { ProductCreateOrConnectWithoutCartItemVariantsInputSchema } from './ProductCreateOrConnectWithoutCartItemVariantsInputSchema';
import { ProductUpsertWithoutCartItemVariantsInputSchema } from './ProductUpsertWithoutCartItemVariantsInputSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductUpdateToOneWithWhereWithoutCartItemVariantsInputSchema } from './ProductUpdateToOneWithWhereWithoutCartItemVariantsInputSchema';
import { ProductUpdateWithoutCartItemVariantsInputSchema } from './ProductUpdateWithoutCartItemVariantsInputSchema';
import { ProductUncheckedUpdateWithoutCartItemVariantsInputSchema } from './ProductUncheckedUpdateWithoutCartItemVariantsInputSchema';

export const ProductUpdateOneWithoutCartItemVariantsNestedInputSchema: z.ZodType<Prisma.ProductUpdateOneWithoutCartItemVariantsNestedInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutCartItemVariantsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutCartItemVariantsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutCartItemVariantsInputSchema).optional(),
  upsert: z.lazy(() => ProductUpsertWithoutCartItemVariantsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ProductWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ProductUpdateToOneWithWhereWithoutCartItemVariantsInputSchema),z.lazy(() => ProductUpdateWithoutCartItemVariantsInputSchema),z.lazy(() => ProductUncheckedUpdateWithoutCartItemVariantsInputSchema) ]).optional(),
}).strict();

export default ProductUpdateOneWithoutCartItemVariantsNestedInputSchema;
