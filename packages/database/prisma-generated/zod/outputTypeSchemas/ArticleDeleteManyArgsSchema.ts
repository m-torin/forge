import { z } from 'zod';
import type { Prisma } from '../../client';
import { ArticleWhereInputSchema } from '../inputTypeSchemas/ArticleWhereInputSchema';

export const ArticleDeleteManyArgsSchema: z.ZodType<Prisma.ArticleDeleteManyArgs> = z
  .object({
    where: ArticleWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default ArticleDeleteManyArgsSchema;
