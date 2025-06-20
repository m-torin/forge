import { z } from 'zod';
import type { Prisma } from '../../client';

export const StoryCountOutputTypeSelectSchema: z.ZodType<Prisma.StoryCountOutputTypeSelect> = z.object({
  products: z.boolean().optional(),
  jrFindReplaceRejects: z.boolean().optional(),
}).strict();

export default StoryCountOutputTypeSelectSchema;
