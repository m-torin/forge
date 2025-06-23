import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinCreateWithoutMediaInputSchema } from './PdpJoinCreateWithoutMediaInputSchema';
import { PdpJoinUncheckedCreateWithoutMediaInputSchema } from './PdpJoinUncheckedCreateWithoutMediaInputSchema';

export const PdpJoinCreateOrConnectWithoutMediaInputSchema: z.ZodType<Prisma.PdpJoinCreateOrConnectWithoutMediaInput> =
  z
    .object({
      where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => PdpJoinCreateWithoutMediaInputSchema),
        z.lazy(() => PdpJoinUncheckedCreateWithoutMediaInputSchema),
      ]),
    })
    .strict();

export default PdpJoinCreateOrConnectWithoutMediaInputSchema;
