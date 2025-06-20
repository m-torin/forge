import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomCreateWithoutDeletedByInputSchema } from './FandomCreateWithoutDeletedByInputSchema';
import { FandomUncheckedCreateWithoutDeletedByInputSchema } from './FandomUncheckedCreateWithoutDeletedByInputSchema';

export const FandomCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.FandomCreateOrConnectWithoutDeletedByInput> = z.object({
  where: z.lazy(() => FandomWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FandomCreateWithoutDeletedByInputSchema),z.lazy(() => FandomUncheckedCreateWithoutDeletedByInputSchema) ]),
}).strict();

export default FandomCreateOrConnectWithoutDeletedByInputSchema;
