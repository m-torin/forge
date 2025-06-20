import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomUpdateWithoutJrFindReplaceRejectsInputSchema } from './FandomUpdateWithoutJrFindReplaceRejectsInputSchema';
import { FandomUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema } from './FandomUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema';

export const FandomUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.FandomUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInput> = z.object({
  where: z.lazy(() => FandomWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FandomUpdateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => FandomUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema) ]),
}).strict();

export default FandomUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema;
