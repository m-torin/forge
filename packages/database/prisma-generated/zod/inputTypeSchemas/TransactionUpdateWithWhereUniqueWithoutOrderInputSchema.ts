import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionWhereUniqueInputSchema } from './TransactionWhereUniqueInputSchema';
import { TransactionUpdateWithoutOrderInputSchema } from './TransactionUpdateWithoutOrderInputSchema';
import { TransactionUncheckedUpdateWithoutOrderInputSchema } from './TransactionUncheckedUpdateWithoutOrderInputSchema';

export const TransactionUpdateWithWhereUniqueWithoutOrderInputSchema: z.ZodType<Prisma.TransactionUpdateWithWhereUniqueWithoutOrderInput> = z.object({
  where: z.lazy(() => TransactionWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => TransactionUpdateWithoutOrderInputSchema),z.lazy(() => TransactionUncheckedUpdateWithoutOrderInputSchema) ]),
}).strict();

export default TransactionUpdateWithWhereUniqueWithoutOrderInputSchema;
