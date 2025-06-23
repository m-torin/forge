import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinScalarWhereInputSchema } from './PdpJoinScalarWhereInputSchema';
import { PdpJoinUpdateManyMutationInputSchema } from './PdpJoinUpdateManyMutationInputSchema';
import { PdpJoinUncheckedUpdateManyWithoutProductInputSchema } from './PdpJoinUncheckedUpdateManyWithoutProductInputSchema';

export const PdpJoinUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.PdpJoinUpdateManyWithWhereWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => PdpJoinScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => PdpJoinUpdateManyMutationInputSchema),
        z.lazy(() => PdpJoinUncheckedUpdateManyWithoutProductInputSchema),
      ]),
    })
    .strict();

export default PdpJoinUpdateManyWithWhereWithoutProductInputSchema;
