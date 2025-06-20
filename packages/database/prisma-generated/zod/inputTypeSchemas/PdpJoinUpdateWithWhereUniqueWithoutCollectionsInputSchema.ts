import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithoutCollectionsInputSchema } from './PdpJoinUpdateWithoutCollectionsInputSchema';
import { PdpJoinUncheckedUpdateWithoutCollectionsInputSchema } from './PdpJoinUncheckedUpdateWithoutCollectionsInputSchema';

export const PdpJoinUpdateWithWhereUniqueWithoutCollectionsInputSchema: z.ZodType<Prisma.PdpJoinUpdateWithWhereUniqueWithoutCollectionsInput> = z.object({
  where: z.lazy(() => PdpJoinWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PdpJoinUpdateWithoutCollectionsInputSchema),z.lazy(() => PdpJoinUncheckedUpdateWithoutCollectionsInputSchema) ]),
}).strict();

export default PdpJoinUpdateWithWhereUniqueWithoutCollectionsInputSchema;
