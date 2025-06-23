import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinScalarWhereInputSchema } from './PdpJoinScalarWhereInputSchema';
import { PdpJoinUpdateManyMutationInputSchema } from './PdpJoinUpdateManyMutationInputSchema';
import { PdpJoinUncheckedUpdateManyWithoutCollectionsInputSchema } from './PdpJoinUncheckedUpdateManyWithoutCollectionsInputSchema';

export const PdpJoinUpdateManyWithWhereWithoutCollectionsInputSchema: z.ZodType<Prisma.PdpJoinUpdateManyWithWhereWithoutCollectionsInput> =
  z
    .object({
      where: z.lazy(() => PdpJoinScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => PdpJoinUpdateManyMutationInputSchema),
        z.lazy(() => PdpJoinUncheckedUpdateManyWithoutCollectionsInputSchema),
      ]),
    })
    .strict();

export default PdpJoinUpdateManyWithWhereWithoutCollectionsInputSchema;
