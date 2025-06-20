import { z } from 'zod';
import type { Prisma } from '../../client';
import { ArticleCountOutputTypeSelectSchema } from './ArticleCountOutputTypeSelectSchema';

export const ArticleCountOutputTypeArgsSchema: z.ZodType<Prisma.ArticleCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ArticleCountOutputTypeSelectSchema).nullish(),
}).strict();

export default ArticleCountOutputTypeSelectSchema;
