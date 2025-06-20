import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandScalarWhereInputSchema } from './BrandScalarWhereInputSchema';
import { BrandUpdateManyMutationInputSchema } from './BrandUpdateManyMutationInputSchema';
import { BrandUncheckedUpdateManyWithoutDeletedByInputSchema } from './BrandUncheckedUpdateManyWithoutDeletedByInputSchema';

export const BrandUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.BrandUpdateManyWithWhereWithoutDeletedByInput> = z.object({
  where: z.lazy(() => BrandScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BrandUpdateManyMutationInputSchema),z.lazy(() => BrandUncheckedUpdateManyWithoutDeletedByInputSchema) ]),
}).strict();

export default BrandUpdateManyWithWhereWithoutDeletedByInputSchema;
