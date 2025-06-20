import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutProductInputSchema } from './PdpJoinCreateWithoutProductInputSchema';
import { PdpJoinUncheckedCreateWithoutProductInputSchema } from './PdpJoinUncheckedCreateWithoutProductInputSchema';
import { PdpJoinCreateOrConnectWithoutProductInputSchema } from './PdpJoinCreateOrConnectWithoutProductInputSchema';
import { PdpJoinCreateManyProductInputEnvelopeSchema } from './PdpJoinCreateManyProductInputEnvelopeSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';

export const PdpJoinCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.PdpJoinCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutProductInputSchema),z.lazy(() => PdpJoinCreateWithoutProductInputSchema).array(),z.lazy(() => PdpJoinUncheckedCreateWithoutProductInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PdpJoinCreateOrConnectWithoutProductInputSchema),z.lazy(() => PdpJoinCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PdpJoinCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PdpJoinWhereUniqueInputSchema),z.lazy(() => PdpJoinWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default PdpJoinCreateNestedManyWithoutProductInputSchema;
