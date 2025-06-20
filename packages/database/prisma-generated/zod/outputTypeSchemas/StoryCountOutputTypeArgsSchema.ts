import { z } from 'zod';
import type { Prisma } from '../../client';
import { StoryCountOutputTypeSelectSchema } from './StoryCountOutputTypeSelectSchema';

export const StoryCountOutputTypeArgsSchema: z.ZodType<Prisma.StoryCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => StoryCountOutputTypeSelectSchema).nullish(),
}).strict();

export default StoryCountOutputTypeSelectSchema;
