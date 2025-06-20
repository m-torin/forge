import { z } from 'zod';
import type { Prisma } from '../../client';
import { ArticleSelectSchema } from '../inputTypeSchemas/ArticleSelectSchema';
import { ArticleIncludeSchema } from '../inputTypeSchemas/ArticleIncludeSchema';

export const ArticleArgsSchema: z.ZodType<Prisma.ArticleDefaultArgs> = z.object({
  select: z.lazy(() => ArticleSelectSchema).optional(),
  include: z.lazy(() => ArticleIncludeSchema).optional(),
}).strict();

export default ArticleArgsSchema;
