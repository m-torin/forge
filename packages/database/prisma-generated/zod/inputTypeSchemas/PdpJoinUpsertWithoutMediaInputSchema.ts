import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinUpdateWithoutMediaInputSchema } from './PdpJoinUpdateWithoutMediaInputSchema';
import { PdpJoinUncheckedUpdateWithoutMediaInputSchema } from './PdpJoinUncheckedUpdateWithoutMediaInputSchema';
import { PdpJoinCreateWithoutMediaInputSchema } from './PdpJoinCreateWithoutMediaInputSchema';
import { PdpJoinUncheckedCreateWithoutMediaInputSchema } from './PdpJoinUncheckedCreateWithoutMediaInputSchema';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';

export const PdpJoinUpsertWithoutMediaInputSchema: z.ZodType<Prisma.PdpJoinUpsertWithoutMediaInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => PdpJoinUpdateWithoutMediaInputSchema),
        z.lazy(() => PdpJoinUncheckedUpdateWithoutMediaInputSchema),
      ]),
      create: z.union([
        z.lazy(() => PdpJoinCreateWithoutMediaInputSchema),
        z.lazy(() => PdpJoinUncheckedCreateWithoutMediaInputSchema),
      ]),
      where: z.lazy(() => PdpJoinWhereInputSchema).optional(),
    })
    .strict();

export default PdpJoinUpsertWithoutMediaInputSchema;
