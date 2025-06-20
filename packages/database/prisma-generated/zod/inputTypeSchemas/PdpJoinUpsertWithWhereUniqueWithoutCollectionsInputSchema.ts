import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithoutCollectionsInputSchema } from './PdpJoinUpdateWithoutCollectionsInputSchema';
import { PdpJoinUncheckedUpdateWithoutCollectionsInputSchema } from './PdpJoinUncheckedUpdateWithoutCollectionsInputSchema';
import { PdpJoinCreateWithoutCollectionsInputSchema } from './PdpJoinCreateWithoutCollectionsInputSchema';
import { PdpJoinUncheckedCreateWithoutCollectionsInputSchema } from './PdpJoinUncheckedCreateWithoutCollectionsInputSchema';

export const PdpJoinUpsertWithWhereUniqueWithoutCollectionsInputSchema: z.ZodType<Prisma.PdpJoinUpsertWithWhereUniqueWithoutCollectionsInput> = z.object({
  where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PdpJoinUpdateWithoutCollectionsInputSchema),z.lazy(() => PdpJoinUncheckedUpdateWithoutCollectionsInputSchema) ]),
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutCollectionsInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutCollectionsInputSchema) ]),
}).strict();

export default PdpJoinUpsertWithWhereUniqueWithoutCollectionsInputSchema;
