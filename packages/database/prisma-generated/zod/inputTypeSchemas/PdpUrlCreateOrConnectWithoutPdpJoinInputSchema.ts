import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpUrlWhereUniqueInputSchema } from './PdpUrlWhereUniqueInputSchema';
import { PdpUrlCreateWithoutPdpJoinInputSchema } from './PdpUrlCreateWithoutPdpJoinInputSchema';
import { PdpUrlUncheckedCreateWithoutPdpJoinInputSchema } from './PdpUrlUncheckedCreateWithoutPdpJoinInputSchema';

export const PdpUrlCreateOrConnectWithoutPdpJoinInputSchema: z.ZodType<Prisma.PdpUrlCreateOrConnectWithoutPdpJoinInput> =
  z
    .object({
      where: z.lazy(() => PdpUrlWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => PdpUrlCreateWithoutPdpJoinInputSchema),
        z.lazy(() => PdpUrlUncheckedCreateWithoutPdpJoinInputSchema),
      ]),
    })
    .strict();

export default PdpUrlCreateOrConnectWithoutPdpJoinInputSchema;
