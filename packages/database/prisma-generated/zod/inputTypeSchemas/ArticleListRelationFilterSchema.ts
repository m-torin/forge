import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleWhereInputSchema } from './ArticleWhereInputSchema';

export const ArticleListRelationFilterSchema: z.ZodType<Prisma.ArticleListRelationFilter> = z
  .object({
    every: z.lazy(() => ArticleWhereInputSchema).optional(),
    some: z.lazy(() => ArticleWhereInputSchema).optional(),
    none: z.lazy(() => ArticleWhereInputSchema).optional(),
  })
  .strict();

export default ArticleListRelationFilterSchema;
