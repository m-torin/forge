import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductWhereUniqueInputSchema } from './ProductWhereUniqueInputSchema';
import { ProductCreateWithoutSeriesInputSchema } from './ProductCreateWithoutSeriesInputSchema';
import { ProductUncheckedCreateWithoutSeriesInputSchema } from './ProductUncheckedCreateWithoutSeriesInputSchema';

export const ProductCreateOrConnectWithoutSeriesInputSchema: z.ZodType<Prisma.ProductCreateOrConnectWithoutSeriesInput> = z.object({
  where: z.lazy(() => ProductWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ProductCreateWithoutSeriesInputSchema),z.lazy(() => ProductUncheckedCreateWithoutSeriesInputSchema) ]),
}).strict();

export default ProductCreateOrConnectWithoutSeriesInputSchema;
