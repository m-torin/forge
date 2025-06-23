import { z } from 'zod';
import type { Prisma } from '../../client';
import { ArticleWhereInputSchema } from '../inputTypeSchemas/ArticleWhereInputSchema';
import { ArticleOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ArticleOrderByWithAggregationInputSchema';
import { ArticleScalarFieldEnumSchema } from '../inputTypeSchemas/ArticleScalarFieldEnumSchema';
import { ArticleScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ArticleScalarWhereWithAggregatesInputSchema';

export const ArticleGroupByArgsSchema: z.ZodType<Prisma.ArticleGroupByArgs> = z
  .object({
    where: ArticleWhereInputSchema.optional(),
    orderBy: z
      .union([
        ArticleOrderByWithAggregationInputSchema.array(),
        ArticleOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: ArticleScalarFieldEnumSchema.array(),
    having: ArticleScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default ArticleGroupByArgsSchema;
