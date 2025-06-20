import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';
import { CastCreateWithoutDeletedByInputSchema } from './CastCreateWithoutDeletedByInputSchema';
import { CastUncheckedCreateWithoutDeletedByInputSchema } from './CastUncheckedCreateWithoutDeletedByInputSchema';

export const CastCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.CastCreateOrConnectWithoutDeletedByInput> = z.object({
  where: z.lazy(() => CastWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CastCreateWithoutDeletedByInputSchema),z.lazy(() => CastUncheckedCreateWithoutDeletedByInputSchema) ]),
}).strict();

export default CastCreateOrConnectWithoutDeletedByInputSchema;
