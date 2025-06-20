import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithoutBrandInputSchema } from './PdpJoinUpdateWithoutBrandInputSchema';
import { PdpJoinUncheckedUpdateWithoutBrandInputSchema } from './PdpJoinUncheckedUpdateWithoutBrandInputSchema';
import { PdpJoinCreateWithoutBrandInputSchema } from './PdpJoinCreateWithoutBrandInputSchema';
import { PdpJoinUncheckedCreateWithoutBrandInputSchema } from './PdpJoinUncheckedCreateWithoutBrandInputSchema';

export const PdpJoinUpsertWithWhereUniqueWithoutBrandInputSchema: z.ZodType<Prisma.PdpJoinUpsertWithWhereUniqueWithoutBrandInput> = z.object({
  where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PdpJoinUpdateWithoutBrandInputSchema),z.lazy(() => PdpJoinUncheckedUpdateWithoutBrandInputSchema) ]),
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutBrandInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutBrandInputSchema) ]),
}).strict();

export default PdpJoinUpsertWithWhereUniqueWithoutBrandInputSchema;
