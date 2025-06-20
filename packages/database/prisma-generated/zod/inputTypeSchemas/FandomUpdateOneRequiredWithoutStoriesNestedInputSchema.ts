import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomCreateWithoutStoriesInputSchema } from './FandomCreateWithoutStoriesInputSchema';
import { FandomUncheckedCreateWithoutStoriesInputSchema } from './FandomUncheckedCreateWithoutStoriesInputSchema';
import { FandomCreateOrConnectWithoutStoriesInputSchema } from './FandomCreateOrConnectWithoutStoriesInputSchema';
import { FandomUpsertWithoutStoriesInputSchema } from './FandomUpsertWithoutStoriesInputSchema';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomUpdateToOneWithWhereWithoutStoriesInputSchema } from './FandomUpdateToOneWithWhereWithoutStoriesInputSchema';
import { FandomUpdateWithoutStoriesInputSchema } from './FandomUpdateWithoutStoriesInputSchema';
import { FandomUncheckedUpdateWithoutStoriesInputSchema } from './FandomUncheckedUpdateWithoutStoriesInputSchema';

export const FandomUpdateOneRequiredWithoutStoriesNestedInputSchema: z.ZodType<Prisma.FandomUpdateOneRequiredWithoutStoriesNestedInput> = z.object({
  create: z.union([ z.lazy(() => FandomCreateWithoutStoriesInputSchema),z.lazy(() => FandomUncheckedCreateWithoutStoriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => FandomCreateOrConnectWithoutStoriesInputSchema).optional(),
  upsert: z.lazy(() => FandomUpsertWithoutStoriesInputSchema).optional(),
  connect: z.lazy(() => FandomWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => FandomUpdateToOneWithWhereWithoutStoriesInputSchema),z.lazy(() => FandomUpdateWithoutStoriesInputSchema),z.lazy(() => FandomUncheckedUpdateWithoutStoriesInputSchema) ]).optional(),
}).strict();

export default FandomUpdateOneRequiredWithoutStoriesNestedInputSchema;
