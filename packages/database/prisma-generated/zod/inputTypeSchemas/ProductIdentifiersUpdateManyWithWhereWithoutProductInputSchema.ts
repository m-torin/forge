import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersScalarWhereInputSchema } from './ProductIdentifiersScalarWhereInputSchema';
import { ProductIdentifiersUpdateManyMutationInputSchema } from './ProductIdentifiersUpdateManyMutationInputSchema';
import { ProductIdentifiersUncheckedUpdateManyWithoutProductInputSchema } from './ProductIdentifiersUncheckedUpdateManyWithoutProductInputSchema';

export const ProductIdentifiersUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.ProductIdentifiersUpdateManyWithWhereWithoutProductInput> = z.object({
  where: z.lazy(() => ProductIdentifiersScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductIdentifiersUpdateManyMutationInputSchema),z.lazy(() => ProductIdentifiersUncheckedUpdateManyWithoutProductInputSchema) ]),
}).strict();

export default ProductIdentifiersUpdateManyWithWhereWithoutProductInputSchema;
