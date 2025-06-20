import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';
import { PdpJoinUpdateWithoutMediaInputSchema } from './PdpJoinUpdateWithoutMediaInputSchema';
import { PdpJoinUncheckedUpdateWithoutMediaInputSchema } from './PdpJoinUncheckedUpdateWithoutMediaInputSchema';

export const PdpJoinUpdateToOneWithWhereWithoutMediaInputSchema: z.ZodType<Prisma.PdpJoinUpdateToOneWithWhereWithoutMediaInput> = z.object({
  where: z.lazy(() => PdpJoinWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => PdpJoinUpdateWithoutMediaInputSchema),z.lazy(() => PdpJoinUncheckedUpdateWithoutMediaInputSchema) ]),
}).strict();

export default PdpJoinUpdateToOneWithWhereWithoutMediaInputSchema;
