import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomUpdateWithoutStoriesInputSchema } from './FandomUpdateWithoutStoriesInputSchema';
import { FandomUncheckedUpdateWithoutStoriesInputSchema } from './FandomUncheckedUpdateWithoutStoriesInputSchema';
import { FandomCreateWithoutStoriesInputSchema } from './FandomCreateWithoutStoriesInputSchema';
import { FandomUncheckedCreateWithoutStoriesInputSchema } from './FandomUncheckedCreateWithoutStoriesInputSchema';
import { FandomWhereInputSchema } from './FandomWhereInputSchema';

export const FandomUpsertWithoutStoriesInputSchema: z.ZodType<Prisma.FandomUpsertWithoutStoriesInput> = z.object({
  update: z.union([ z.lazy(() => FandomUpdateWithoutStoriesInputSchema),z.lazy(() => FandomUncheckedUpdateWithoutStoriesInputSchema) ]),
  create: z.union([ z.lazy(() => FandomCreateWithoutStoriesInputSchema),z.lazy(() => FandomUncheckedCreateWithoutStoriesInputSchema) ]),
  where: z.lazy(() => FandomWhereInputSchema).optional()
}).strict();

export default FandomUpsertWithoutStoriesInputSchema;
