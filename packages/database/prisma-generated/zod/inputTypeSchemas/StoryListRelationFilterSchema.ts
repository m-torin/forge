import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereInputSchema } from './StoryWhereInputSchema';

export const StoryListRelationFilterSchema: z.ZodType<Prisma.StoryListRelationFilter> = z.object({
  every: z.lazy(() => StoryWhereInputSchema).optional(),
  some: z.lazy(() => StoryWhereInputSchema).optional(),
  none: z.lazy(() => StoryWhereInputSchema).optional()
}).strict();

export default StoryListRelationFilterSchema;
