import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinCreateWithoutProductInputSchema } from './PdpJoinCreateWithoutProductInputSchema';
import { PdpJoinUncheckedCreateWithoutProductInputSchema } from './PdpJoinUncheckedCreateWithoutProductInputSchema';

export const PdpJoinCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.PdpJoinCreateOrConnectWithoutProductInput> = z.object({
  where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutProductInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export default PdpJoinCreateOrConnectWithoutProductInputSchema;
