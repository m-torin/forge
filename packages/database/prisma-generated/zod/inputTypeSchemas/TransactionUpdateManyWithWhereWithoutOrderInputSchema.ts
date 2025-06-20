import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionScalarWhereInputSchema } from './TransactionScalarWhereInputSchema';
import { TransactionUpdateManyMutationInputSchema } from './TransactionUpdateManyMutationInputSchema';
import { TransactionUncheckedUpdateManyWithoutOrderInputSchema } from './TransactionUncheckedUpdateManyWithoutOrderInputSchema';

export const TransactionUpdateManyWithWhereWithoutOrderInputSchema: z.ZodType<Prisma.TransactionUpdateManyWithWhereWithoutOrderInput> = z.object({
  where: z.lazy(() => TransactionScalarWhereInputSchema),
  data: z.union([ z.lazy(() => TransactionUpdateManyMutationInputSchema),z.lazy(() => TransactionUncheckedUpdateManyWithoutOrderInputSchema) ]),
}).strict();

export default TransactionUpdateManyWithWhereWithoutOrderInputSchema;
