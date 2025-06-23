import { z } from 'zod';
import type { Prisma } from '../../client';
import { ArticleUpdateManyMutationInputSchema } from '../inputTypeSchemas/ArticleUpdateManyMutationInputSchema';
import { ArticleUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ArticleUncheckedUpdateManyInputSchema';
import { ArticleWhereInputSchema } from '../inputTypeSchemas/ArticleWhereInputSchema';

export const ArticleUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ArticleUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([ArticleUpdateManyMutationInputSchema, ArticleUncheckedUpdateManyInputSchema]),
      where: ArticleWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default ArticleUpdateManyAndReturnArgsSchema;
