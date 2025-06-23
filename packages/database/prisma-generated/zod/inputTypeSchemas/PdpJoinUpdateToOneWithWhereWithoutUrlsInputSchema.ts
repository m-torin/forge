import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';
import { PdpJoinUpdateWithoutUrlsInputSchema } from './PdpJoinUpdateWithoutUrlsInputSchema';
import { PdpJoinUncheckedUpdateWithoutUrlsInputSchema } from './PdpJoinUncheckedUpdateWithoutUrlsInputSchema';

export const PdpJoinUpdateToOneWithWhereWithoutUrlsInputSchema: z.ZodType<Prisma.PdpJoinUpdateToOneWithWhereWithoutUrlsInput> =
  z
    .object({
      where: z.lazy(() => PdpJoinWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => PdpJoinUpdateWithoutUrlsInputSchema),
        z.lazy(() => PdpJoinUncheckedUpdateWithoutUrlsInputSchema),
      ]),
    })
    .strict();

export default PdpJoinUpdateToOneWithWhereWithoutUrlsInputSchema;
