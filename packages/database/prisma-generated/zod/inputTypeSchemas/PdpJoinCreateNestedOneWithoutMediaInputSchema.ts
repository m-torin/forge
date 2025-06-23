import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutMediaInputSchema } from './PdpJoinCreateWithoutMediaInputSchema';
import { PdpJoinUncheckedCreateWithoutMediaInputSchema } from './PdpJoinUncheckedCreateWithoutMediaInputSchema';
import { PdpJoinCreateOrConnectWithoutMediaInputSchema } from './PdpJoinCreateOrConnectWithoutMediaInputSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';

export const PdpJoinCreateNestedOneWithoutMediaInputSchema: z.ZodType<Prisma.PdpJoinCreateNestedOneWithoutMediaInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => PdpJoinCreateWithoutMediaInputSchema),
          z.lazy(() => PdpJoinUncheckedCreateWithoutMediaInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => PdpJoinCreateOrConnectWithoutMediaInputSchema).optional(),
      connect: z.lazy(() => PdpJoinWhereUniqueInputSchema).optional(),
    })
    .strict();

export default PdpJoinCreateNestedOneWithoutMediaInputSchema;
