import { z } from 'zod';
import type { Prisma } from '../../client';
import { ArticleCreateManyInputSchema } from '../inputTypeSchemas/ArticleCreateManyInputSchema'

export const ArticleCreateManyArgsSchema: z.ZodType<Prisma.ArticleCreateManyArgs> = z.object({
  data: z.union([ ArticleCreateManyInputSchema,ArticleCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ArticleCreateManyArgsSchema;
