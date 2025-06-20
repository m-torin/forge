import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomScalarWhereInputSchema } from './FandomScalarWhereInputSchema';
import { FandomUpdateManyMutationInputSchema } from './FandomUpdateManyMutationInputSchema';
import { FandomUncheckedUpdateManyWithoutDeletedByInputSchema } from './FandomUncheckedUpdateManyWithoutDeletedByInputSchema';

export const FandomUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.FandomUpdateManyWithWhereWithoutDeletedByInput> = z.object({
  where: z.lazy(() => FandomScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FandomUpdateManyMutationInputSchema),z.lazy(() => FandomUncheckedUpdateManyWithoutDeletedByInputSchema) ]),
}).strict();

export default FandomUpdateManyWithWhereWithoutDeletedByInputSchema;
