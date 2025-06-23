import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinUpdateWithoutUrlsInputSchema } from './PdpJoinUpdateWithoutUrlsInputSchema';
import { PdpJoinUncheckedUpdateWithoutUrlsInputSchema } from './PdpJoinUncheckedUpdateWithoutUrlsInputSchema';
import { PdpJoinCreateWithoutUrlsInputSchema } from './PdpJoinCreateWithoutUrlsInputSchema';
import { PdpJoinUncheckedCreateWithoutUrlsInputSchema } from './PdpJoinUncheckedCreateWithoutUrlsInputSchema';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';

export const PdpJoinUpsertWithoutUrlsInputSchema: z.ZodType<Prisma.PdpJoinUpsertWithoutUrlsInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => PdpJoinUpdateWithoutUrlsInputSchema),
        z.lazy(() => PdpJoinUncheckedUpdateWithoutUrlsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => PdpJoinCreateWithoutUrlsInputSchema),
        z.lazy(() => PdpJoinUncheckedCreateWithoutUrlsInputSchema),
      ]),
      where: z.lazy(() => PdpJoinWhereInputSchema).optional(),
    })
    .strict();

export default PdpJoinUpsertWithoutUrlsInputSchema;
