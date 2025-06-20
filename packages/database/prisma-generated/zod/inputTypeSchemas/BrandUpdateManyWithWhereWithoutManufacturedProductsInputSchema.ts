import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandScalarWhereInputSchema } from './BrandScalarWhereInputSchema';
import { BrandUpdateManyMutationInputSchema } from './BrandUpdateManyMutationInputSchema';
import { BrandUncheckedUpdateManyWithoutManufacturedProductsInputSchema } from './BrandUncheckedUpdateManyWithoutManufacturedProductsInputSchema';

export const BrandUpdateManyWithWhereWithoutManufacturedProductsInputSchema: z.ZodType<Prisma.BrandUpdateManyWithWhereWithoutManufacturedProductsInput> = z.object({
  where: z.lazy(() => BrandScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BrandUpdateManyMutationInputSchema),z.lazy(() => BrandUncheckedUpdateManyWithoutManufacturedProductsInputSchema) ]),
}).strict();

export default BrandUpdateManyWithWhereWithoutManufacturedProductsInputSchema;
