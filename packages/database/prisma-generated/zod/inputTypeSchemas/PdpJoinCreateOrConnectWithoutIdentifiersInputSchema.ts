import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinCreateWithoutIdentifiersInputSchema } from './PdpJoinCreateWithoutIdentifiersInputSchema';
import { PdpJoinUncheckedCreateWithoutIdentifiersInputSchema } from './PdpJoinUncheckedCreateWithoutIdentifiersInputSchema';

export const PdpJoinCreateOrConnectWithoutIdentifiersInputSchema: z.ZodType<Prisma.PdpJoinCreateOrConnectWithoutIdentifiersInput> = z.object({
  where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutIdentifiersInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutIdentifiersInputSchema) ]),
}).strict();

export default PdpJoinCreateOrConnectWithoutIdentifiersInputSchema;
