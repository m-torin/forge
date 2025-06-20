import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomCreateWithoutStoriesInputSchema } from './FandomCreateWithoutStoriesInputSchema';
import { FandomUncheckedCreateWithoutStoriesInputSchema } from './FandomUncheckedCreateWithoutStoriesInputSchema';
import { FandomCreateOrConnectWithoutStoriesInputSchema } from './FandomCreateOrConnectWithoutStoriesInputSchema';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';

export const FandomCreateNestedOneWithoutStoriesInputSchema: z.ZodType<Prisma.FandomCreateNestedOneWithoutStoriesInput> = z.object({
  create: z.union([ z.lazy(() => FandomCreateWithoutStoriesInputSchema),z.lazy(() => FandomUncheckedCreateWithoutStoriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FandomCreateOrConnectWithoutStoriesInputSchema).optional(),
  connect: z.lazy(() => FandomWhereUniqueInputSchema).optional()
}).strict();

export default FandomCreateNestedOneWithoutStoriesInputSchema;
