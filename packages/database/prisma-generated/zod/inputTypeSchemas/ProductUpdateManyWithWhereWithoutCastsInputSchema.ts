import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';
import { ProductUpdateManyMutationInputSchema } from './ProductUpdateManyMutationInputSchema';
import { ProductUncheckedUpdateManyWithoutCastsInputSchema } from './ProductUncheckedUpdateManyWithoutCastsInputSchema';

export const ProductUpdateManyWithWhereWithoutCastsInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutCastsInput> = z.object({
  where: z.lazy(() => ProductScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateManyMutationInputSchema),z.lazy(() => ProductUncheckedUpdateManyWithoutCastsInputSchema) ]),
}).strict();

export default ProductUpdateManyWithWhereWithoutCastsInputSchema;
