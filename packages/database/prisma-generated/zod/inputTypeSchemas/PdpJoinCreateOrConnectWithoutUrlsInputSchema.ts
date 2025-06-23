import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinCreateWithoutUrlsInputSchema } from './PdpJoinCreateWithoutUrlsInputSchema';
import { PdpJoinUncheckedCreateWithoutUrlsInputSchema } from './PdpJoinUncheckedCreateWithoutUrlsInputSchema';

export const PdpJoinCreateOrConnectWithoutUrlsInputSchema: z.ZodType<Prisma.PdpJoinCreateOrConnectWithoutUrlsInput> =
  z
    .object({
      where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => PdpJoinCreateWithoutUrlsInputSchema),
        z.lazy(() => PdpJoinUncheckedCreateWithoutUrlsInputSchema),
      ]),
    })
    .strict();

export default PdpJoinCreateOrConnectWithoutUrlsInputSchema;
