import { z } from 'zod';
import type { Prisma } from '../../client';

export const ArticleCountOutputTypeSelectSchema: z.ZodType<Prisma.ArticleCountOutputTypeSelect> = z.object({
  media: z.boolean().optional(),
}).strict();

export default ArticleCountOutputTypeSelectSchema;
