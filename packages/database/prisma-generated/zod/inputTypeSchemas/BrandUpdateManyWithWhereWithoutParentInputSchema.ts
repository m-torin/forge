import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandScalarWhereInputSchema } from './BrandScalarWhereInputSchema';
import { BrandUpdateManyMutationInputSchema } from './BrandUpdateManyMutationInputSchema';
import { BrandUncheckedUpdateManyWithoutParentInputSchema } from './BrandUncheckedUpdateManyWithoutParentInputSchema';

export const BrandUpdateManyWithWhereWithoutParentInputSchema: z.ZodType<Prisma.BrandUpdateManyWithWhereWithoutParentInput> = z.object({
  where: z.lazy(() => BrandScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BrandUpdateManyMutationInputSchema),z.lazy(() => BrandUncheckedUpdateManyWithoutParentInputSchema) ]),
}).strict();

export default BrandUpdateManyWithWhereWithoutParentInputSchema;
