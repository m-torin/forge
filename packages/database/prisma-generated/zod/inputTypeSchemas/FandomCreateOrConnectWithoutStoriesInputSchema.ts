import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomCreateWithoutStoriesInputSchema } from './FandomCreateWithoutStoriesInputSchema';
import { FandomUncheckedCreateWithoutStoriesInputSchema } from './FandomUncheckedCreateWithoutStoriesInputSchema';

export const FandomCreateOrConnectWithoutStoriesInputSchema: z.ZodType<Prisma.FandomCreateOrConnectWithoutStoriesInput> = z.object({
  where: z.lazy(() => FandomWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FandomCreateWithoutStoriesInputSchema),z.lazy(() => FandomUncheckedCreateWithoutStoriesInputSchema) ]),
}).strict();

export default FandomCreateOrConnectWithoutStoriesInputSchema;
