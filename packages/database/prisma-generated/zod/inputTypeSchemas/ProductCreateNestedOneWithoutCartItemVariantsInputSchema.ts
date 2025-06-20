import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateWithoutCartItemVariantsInputSchema } from './ProductCreateWithoutCartItemVariantsInputSchema';
import { ProductUncheckedCreateWithoutCartItemVariantsInputSchema } from './ProductUncheckedCreateWithoutCartItemVariantsInputSchema';
import { ProductCreateOrConnectWithoutCartItemVariantsInputSchema } from './ProductCreateOrConnectWithoutCartItemVariantsInputSchema';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';

export const ProductCreateNestedOneWithoutCartItemVariantsInputSchema: z.ZodType<Prisma.ProductCreateNestedOneWithoutCartItemVariantsInput> = z.object({
  create: z.union([ z.lazy(() => ProductCreateWithoutCartItemVariantsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutCartItemVariantsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ProductCreateOrConnectWithoutCartItemVariantsInputSchema).optional(),
  connect: z.lazy(() => ProductWhereUniqueInputSchema).optional()
}).strict();

export default ProductCreateNestedOneWithoutCartItemVariantsInputSchema;
