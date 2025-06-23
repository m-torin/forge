import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpUrlScalarWhereInputSchema } from './PdpUrlScalarWhereInputSchema';
import { PdpUrlUpdateManyMutationInputSchema } from './PdpUrlUpdateManyMutationInputSchema';
import { PdpUrlUncheckedUpdateManyWithoutPdpJoinInputSchema } from './PdpUrlUncheckedUpdateManyWithoutPdpJoinInputSchema';

export const PdpUrlUpdateManyWithWhereWithoutPdpJoinInputSchema: z.ZodType<Prisma.PdpUrlUpdateManyWithWhereWithoutPdpJoinInput> =
  z
    .object({
      where: z.lazy(() => PdpUrlScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => PdpUrlUpdateManyMutationInputSchema),
        z.lazy(() => PdpUrlUncheckedUpdateManyWithoutPdpJoinInputSchema),
      ]),
    })
    .strict();

export default PdpUrlUpdateManyWithWhereWithoutPdpJoinInputSchema;
