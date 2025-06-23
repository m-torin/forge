import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithoutProductInputSchema } from './PdpJoinUpdateWithoutProductInputSchema';
import { PdpJoinUncheckedUpdateWithoutProductInputSchema } from './PdpJoinUncheckedUpdateWithoutProductInputSchema';

export const PdpJoinUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.PdpJoinUpdateWithWhereUniqueWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => PdpJoinUpdateWithoutProductInputSchema),
        z.lazy(() => PdpJoinUncheckedUpdateWithoutProductInputSchema),
      ]),
    })
    .strict();

export default PdpJoinUpdateWithWhereUniqueWithoutProductInputSchema;
