import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithoutProductInputSchema } from './PdpJoinUpdateWithoutProductInputSchema';
import { PdpJoinUncheckedUpdateWithoutProductInputSchema } from './PdpJoinUncheckedUpdateWithoutProductInputSchema';
import { PdpJoinCreateWithoutProductInputSchema } from './PdpJoinCreateWithoutProductInputSchema';
import { PdpJoinUncheckedCreateWithoutProductInputSchema } from './PdpJoinUncheckedCreateWithoutProductInputSchema';

export const PdpJoinUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.PdpJoinUpsertWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PdpJoinUpdateWithoutProductInputSchema),z.lazy(() => PdpJoinUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutProductInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export default PdpJoinUpsertWithWhereUniqueWithoutProductInputSchema;
