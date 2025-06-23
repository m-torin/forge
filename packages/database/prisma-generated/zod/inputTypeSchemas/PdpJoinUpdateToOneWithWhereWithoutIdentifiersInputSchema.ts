import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';
import { PdpJoinUpdateWithoutIdentifiersInputSchema } from './PdpJoinUpdateWithoutIdentifiersInputSchema';
import { PdpJoinUncheckedUpdateWithoutIdentifiersInputSchema } from './PdpJoinUncheckedUpdateWithoutIdentifiersInputSchema';

export const PdpJoinUpdateToOneWithWhereWithoutIdentifiersInputSchema: z.ZodType<Prisma.PdpJoinUpdateToOneWithWhereWithoutIdentifiersInput> =
  z
    .object({
      where: z.lazy(() => PdpJoinWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => PdpJoinUpdateWithoutIdentifiersInputSchema),
        z.lazy(() => PdpJoinUncheckedUpdateWithoutIdentifiersInputSchema),
      ]),
    })
    .strict();

export default PdpJoinUpdateToOneWithWhereWithoutIdentifiersInputSchema;
