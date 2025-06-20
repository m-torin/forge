import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinCreateWithoutLocationsInputSchema } from './PdpJoinCreateWithoutLocationsInputSchema';
import { PdpJoinUncheckedCreateWithoutLocationsInputSchema } from './PdpJoinUncheckedCreateWithoutLocationsInputSchema';

export const PdpJoinCreateOrConnectWithoutLocationsInputSchema: z.ZodType<Prisma.PdpJoinCreateOrConnectWithoutLocationsInput> = z.object({
  where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutLocationsInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutLocationsInputSchema) ]),
}).strict();

export default PdpJoinCreateOrConnectWithoutLocationsInputSchema;
