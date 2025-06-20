import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersScalarWhereInputSchema } from './ProductIdentifiersScalarWhereInputSchema';
import { ProductIdentifiersUpdateManyMutationInputSchema } from './ProductIdentifiersUpdateManyMutationInputSchema';
import { ProductIdentifiersUncheckedUpdateManyWithoutCollectionInputSchema } from './ProductIdentifiersUncheckedUpdateManyWithoutCollectionInputSchema';

export const ProductIdentifiersUpdateManyWithWhereWithoutCollectionInputSchema: z.ZodType<Prisma.ProductIdentifiersUpdateManyWithWhereWithoutCollectionInput> = z.object({
  where: z.lazy(() => ProductIdentifiersScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductIdentifiersUpdateManyMutationInputSchema),z.lazy(() => ProductIdentifiersUncheckedUpdateManyWithoutCollectionInputSchema) ]),
}).strict();

export default ProductIdentifiersUpdateManyWithWhereWithoutCollectionInputSchema;
