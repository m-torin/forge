import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutCartItemVariantsInputSchema } from './ProductCreateWithoutCartItemVariantsInputSchema';
import { ProductUncheckedCreateWithoutCartItemVariantsInputSchema } from './ProductUncheckedCreateWithoutCartItemVariantsInputSchema';

export const ProductCreateOrConnectWithoutCartItemVariantsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutCartItemVariantsInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutCartItemVariantsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutCartItemVariantsInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutCartItemVariantsInputSchema;
