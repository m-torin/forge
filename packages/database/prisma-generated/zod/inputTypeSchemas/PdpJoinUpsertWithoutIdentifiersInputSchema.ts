import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinUpdateWithoutIdentifiersInputSchema } from './PdpJoinUpdateWithoutIdentifiersInputSchema';
import { PdpJoinUncheckedUpdateWithoutIdentifiersInputSchema } from './PdpJoinUncheckedUpdateWithoutIdentifiersInputSchema';
import { PdpJoinCreateWithoutIdentifiersInputSchema } from './PdpJoinCreateWithoutIdentifiersInputSchema';
import { PdpJoinUncheckedCreateWithoutIdentifiersInputSchema } from './PdpJoinUncheckedCreateWithoutIdentifiersInputSchema';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';

export const PdpJoinUpsertWithoutIdentifiersInputSchema: z.ZodType<Prisma.PdpJoinUpsertWithoutIdentifiersInput> = z.object({
  update: z.union([ z.lazy(() => PdpJoinUpdateWithoutIdentifiersInputSchema),z.lazy(() => PdpJoinUncheckedUpdateWithoutIdentifiersInputSchema) ]),
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutIdentifiersInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutIdentifiersInputSchema) ]),
  where: z.lazy(() => PdpJoinWhereInputSchema).optional()
}).strict();

export default PdpJoinUpsertWithoutIdentifiersInputSchema;
