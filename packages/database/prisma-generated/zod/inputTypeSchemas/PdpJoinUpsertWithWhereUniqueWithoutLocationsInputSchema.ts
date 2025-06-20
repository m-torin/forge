import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithoutLocationsInputSchema } from './PdpJoinUpdateWithoutLocationsInputSchema';
import { PdpJoinUncheckedUpdateWithoutLocationsInputSchema } from './PdpJoinUncheckedUpdateWithoutLocationsInputSchema';
import { PdpJoinCreateWithoutLocationsInputSchema } from './PdpJoinCreateWithoutLocationsInputSchema';
import { PdpJoinUncheckedCreateWithoutLocationsInputSchema } from './PdpJoinUncheckedCreateWithoutLocationsInputSchema';

export const PdpJoinUpsertWithWhereUniqueWithoutLocationsInputSchema: z.ZodType<Prisma.PdpJoinUpsertWithWhereUniqueWithoutLocationsInput> = z.object({
  where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PdpJoinUpdateWithoutLocationsInputSchema),z.lazy(() => PdpJoinUncheckedUpdateWithoutLocationsInputSchema) ]),
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutLocationsInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutLocationsInputSchema) ]),
}).strict();

export default PdpJoinUpsertWithWhereUniqueWithoutLocationsInputSchema;
