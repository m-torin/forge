import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastCreateWithoutDeletedByInputSchema } from './CastCreateWithoutDeletedByInputSchema';
import { CastUncheckedCreateWithoutDeletedByInputSchema } from './CastUncheckedCreateWithoutDeletedByInputSchema';
import { CastCreateOrConnectWithoutDeletedByInputSchema } from './CastCreateOrConnectWithoutDeletedByInputSchema';
import { CastCreateManyDeletedByInputEnvelopeSchema } from './CastCreateManyDeletedByInputEnvelopeSchema';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';

export const CastCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.CastCreateNestedManyWithoutDeletedByInput> = z.object({
  create: z.union([ z.lazy(() => CastCreateWithoutDeletedByInputSchema),z.lazy(() => CastCreateWithoutDeletedByInputSchema).array(),z.lazy(() => CastUncheckedCreateWithoutDeletedByInputSchema),z.lazy(() => CastUncheckedCreateWithoutDeletedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CastCreateOrConnectWithoutDeletedByInputSchema),z.lazy(() => CastCreateOrConnectWithoutDeletedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CastCreateManyDeletedByInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CastWhereUniqueInputSchema),z.lazy(() => CastWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CastCreateNestedManyWithoutDeletedByInputSchema;
