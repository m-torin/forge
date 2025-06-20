import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithoutFandomInputSchema } from './StoryUpdateWithoutFandomInputSchema';
import { StoryUncheckedUpdateWithoutFandomInputSchema } from './StoryUncheckedUpdateWithoutFandomInputSchema';
import { StoryCreateWithoutFandomInputSchema } from './StoryCreateWithoutFandomInputSchema';
import { StoryUncheckedCreateWithoutFandomInputSchema } from './StoryUncheckedCreateWithoutFandomInputSchema';

export const StoryUpsertWithWhereUniqueWithoutFandomInputSchema: z.ZodType<Prisma.StoryUpsertWithWhereUniqueWithoutFandomInput> = z.object({
  where: z.lazy(() => StoryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => StoryUpdateWithoutFandomInputSchema),z.lazy(() => StoryUncheckedUpdateWithoutFandomInputSchema) ]),
  create: z.union([ z.lazy(() => StoryCreateWithoutFandomInputSchema),z.lazy(() => StoryUncheckedCreateWithoutFandomInputSchema) ]),
}).strict();

export default StoryUpsertWithWhereUniqueWithoutFandomInputSchema;
