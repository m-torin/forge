import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersScalarWhereInputSchema } from './ProductIdentifiersScalarWhereInputSchema';
import { ProductIdentifiersUpdateManyMutationInputSchema } from './ProductIdentifiersUpdateManyMutationInputSchema';
import { ProductIdentifiersUncheckedUpdateManyWithoutBrandInputSchema } from './ProductIdentifiersUncheckedUpdateManyWithoutBrandInputSchema';

export const ProductIdentifiersUpdateManyWithWhereWithoutBrandInputSchema: z.ZodType<Prisma.ProductIdentifiersUpdateManyWithWhereWithoutBrandInput> =
  z
    .object({
      where: z.lazy(() => ProductIdentifiersScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => ProductIdentifiersUpdateManyMutationInputSchema),
        z.lazy(() => ProductIdentifiersUncheckedUpdateManyWithoutBrandInputSchema),
      ]),
    })
    .strict();

export default ProductIdentifiersUpdateManyWithWhereWithoutBrandInputSchema;
