import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinScalarWhereInputSchema } from './PdpJoinScalarWhereInputSchema';
import { PdpJoinUpdateManyMutationInputSchema } from './PdpJoinUpdateManyMutationInputSchema';
import { PdpJoinUncheckedUpdateManyWithoutLocationsInputSchema } from './PdpJoinUncheckedUpdateManyWithoutLocationsInputSchema';

export const PdpJoinUpdateManyWithWhereWithoutLocationsInputSchema: z.ZodType<Prisma.PdpJoinUpdateManyWithWhereWithoutLocationsInput> = z.object({
  where: z.lazy(() => PdpJoinScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PdpJoinUpdateManyMutationInputSchema),z.lazy(() => PdpJoinUncheckedUpdateManyWithoutLocationsInputSchema) ]),
}).strict();

export default PdpJoinUpdateManyWithWhereWithoutLocationsInputSchema;
