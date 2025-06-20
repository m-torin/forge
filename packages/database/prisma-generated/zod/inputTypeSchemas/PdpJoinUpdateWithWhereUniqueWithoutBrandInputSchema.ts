import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithoutBrandInputSchema } from './PdpJoinUpdateWithoutBrandInputSchema';
import { PdpJoinUncheckedUpdateWithoutBrandInputSchema } from './PdpJoinUncheckedUpdateWithoutBrandInputSchema';

export const PdpJoinUpdateWithWhereUniqueWithoutBrandInputSchema: z.ZodType<Prisma.PdpJoinUpdateWithWhereUniqueWithoutBrandInput> = z.object({
  where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PdpJoinUpdateWithoutBrandInputSchema),z.lazy(() => PdpJoinUncheckedUpdateWithoutBrandInputSchema) ]),
}).strict();

export default PdpJoinUpdateWithWhereUniqueWithoutBrandInputSchema;
