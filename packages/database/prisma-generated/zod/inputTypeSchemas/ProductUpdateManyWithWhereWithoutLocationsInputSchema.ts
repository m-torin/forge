import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductScalarWhereInputSchema } from './ProductScalarWhereInputSchema';
import { ProductUpdateManyMutationInputSchema } from './ProductUpdateManyMutationInputSchema';
import { ProductUncheckedUpdateManyWithoutLocationsInputSchema } from './ProductUncheckedUpdateManyWithoutLocationsInputSchema';

export const ProductUpdateManyWithWhereWithoutLocationsInputSchema: z.ZodType<Prisma.ProductUpdateManyWithWhereWithoutLocationsInput> =
  z
    .object({
      where: z.lazy(() => ProductScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => ProductUpdateManyMutationInputSchema),
        z.lazy(() => ProductUncheckedUpdateManyWithoutLocationsInputSchema),
      ]),
    })
    .strict();

export default ProductUpdateManyWithWhereWithoutLocationsInputSchema;
