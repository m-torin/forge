import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutLocationsInputSchema } from './ProductCreateWithoutLocationsInputSchema';
import { ProductUncheckedCreateWithoutLocationsInputSchema } from './ProductUncheckedCreateWithoutLocationsInputSchema';

export const ProductCreateOrConnectWithoutLocationsInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutLocationsInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutLocationsInputSchema),z.lazy(() => ProductUncheckedCreateWithoutLocationsInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutLocationsInputSchema;
