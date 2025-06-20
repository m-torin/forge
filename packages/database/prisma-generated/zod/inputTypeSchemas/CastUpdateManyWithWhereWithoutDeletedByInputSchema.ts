import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastScalarWhereInputSchema } from './CastScalarWhereInputSchema';
import { CastUpdateManyMutationInputSchema } from './CastUpdateManyMutationInputSchema';
import { CastUncheckedUpdateManyWithoutDeletedByInputSchema } from './CastUncheckedUpdateManyWithoutDeletedByInputSchema';

export const CastUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.CastUpdateManyWithWhereWithoutDeletedByInput> = z.object({
  where: z.lazy(() => CastScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CastUpdateManyMutationInputSchema),z.lazy(() => CastUncheckedUpdateManyWithoutDeletedByInputSchema) ]),
}).strict();

export default CastUpdateManyWithWhereWithoutDeletedByInputSchema;
