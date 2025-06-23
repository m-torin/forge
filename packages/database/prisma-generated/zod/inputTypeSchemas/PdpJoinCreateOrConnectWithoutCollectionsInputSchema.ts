import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinCreateWithoutCollectionsInputSchema } from './PdpJoinCreateWithoutCollectionsInputSchema';
import { PdpJoinUncheckedCreateWithoutCollectionsInputSchema } from './PdpJoinUncheckedCreateWithoutCollectionsInputSchema';

export const PdpJoinCreateOrConnectWithoutCollectionsInputSchema: z.ZodType<Prisma.PdpJoinCreateOrConnectWithoutCollectionsInput> =
  z
    .object({
      where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => PdpJoinCreateWithoutCollectionsInputSchema),
        z.lazy(() => PdpJoinUncheckedCreateWithoutCollectionsInputSchema),
      ]),
    })
    .strict();

export default PdpJoinCreateOrConnectWithoutCollectionsInputSchema;
