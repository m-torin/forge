import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinCreateWithoutBrandInputSchema } from './PdpJoinCreateWithoutBrandInputSchema';
import { PdpJoinUncheckedCreateWithoutBrandInputSchema } from './PdpJoinUncheckedCreateWithoutBrandInputSchema';

export const PdpJoinCreateOrConnectWithoutBrandInputSchema: z.ZodType<Prisma.PdpJoinCreateOrConnectWithoutBrandInput> =
  z
    .object({
      where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => PdpJoinCreateWithoutBrandInputSchema),
        z.lazy(() => PdpJoinUncheckedCreateWithoutBrandInputSchema),
      ]),
    })
    .strict();

export default PdpJoinCreateOrConnectWithoutBrandInputSchema;
