import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinScalarWhereInputSchema } from './PdpJoinScalarWhereInputSchema';
import { PdpJoinUpdateManyMutationInputSchema } from './PdpJoinUpdateManyMutationInputSchema';
import { PdpJoinUncheckedUpdateManyWithoutBrandInputSchema } from './PdpJoinUncheckedUpdateManyWithoutBrandInputSchema';

export const PdpJoinUpdateManyWithWhereWithoutBrandInputSchema: z.ZodType<Prisma.PdpJoinUpdateManyWithWhereWithoutBrandInput> = z.object({
  where: z.lazy(() => PdpJoinScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PdpJoinUpdateManyMutationInputSchema),z.lazy(() => PdpJoinUncheckedUpdateManyWithoutBrandInputSchema) ]),
}).strict();

export default PdpJoinUpdateManyWithWhereWithoutBrandInputSchema;
