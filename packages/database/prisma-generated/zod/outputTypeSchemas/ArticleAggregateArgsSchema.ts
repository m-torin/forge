import { z } from 'zod';
import type { Prisma } from '../../client';
import { ArticleWhereInputSchema } from '../inputTypeSchemas/ArticleWhereInputSchema';
import { ArticleOrderByWithRelationInputSchema } from '../inputTypeSchemas/ArticleOrderByWithRelationInputSchema';
import { ArticleWhereUniqueInputSchema } from '../inputTypeSchemas/ArticleWhereUniqueInputSchema';

export const ArticleAggregateArgsSchema: z.ZodType<Prisma.ArticleAggregateArgs> = z
  .object({
    where: ArticleWhereInputSchema.optional(),
    orderBy: z
      .union([ArticleOrderByWithRelationInputSchema.array(), ArticleOrderByWithRelationInputSchema])
      .optional(),
    cursor: ArticleWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default ArticleAggregateArgsSchema;
