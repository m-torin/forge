import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersScalarWhereInputSchema } from './ProductIdentifiersScalarWhereInputSchema';
import { ProductIdentifiersUpdateManyMutationInputSchema } from './ProductIdentifiersUpdateManyMutationInputSchema';
import { ProductIdentifiersUncheckedUpdateManyWithoutPdpJoinInputSchema } from './ProductIdentifiersUncheckedUpdateManyWithoutPdpJoinInputSchema';

export const ProductIdentifiersUpdateManyWithWhereWithoutPdpJoinInputSchema: z.ZodType<Prisma.ProductIdentifiersUpdateManyWithWhereWithoutPdpJoinInput> = z.object({
  where: z.lazy(() => ProductIdentifiersScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductIdentifiersUpdateManyMutationInputSchema),z.lazy(() => ProductIdentifiersUncheckedUpdateManyWithoutPdpJoinInputSchema) ]),
}).strict();

export default ProductIdentifiersUpdateManyWithWhereWithoutPdpJoinInputSchema;
