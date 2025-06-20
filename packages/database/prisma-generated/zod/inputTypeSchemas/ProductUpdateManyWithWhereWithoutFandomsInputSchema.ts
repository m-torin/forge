import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';
import { ProductUpdateManyMutationInputSchema } from './ProductUpdateManyMutationInputSchema';
import { ProductUncheckedUpdateManyWithoutFandomsInputSchema } from './ProductUncheckedUpdateManyWithoutFandomsInputSchema';

export const ProductUpdateManyWithWhereWithoutFandomsInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutFandomsInput> = z.object({
  where: z.lazy(() => ProductScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ProductUpdateManyMutationInputSchema),z.lazy(() => ProductUncheckedUpdateManyWithoutFandomsInputSchema) ]),
}).strict();

export default ProductUpdateManyWithWhereWithoutFandomsInputSchema;
