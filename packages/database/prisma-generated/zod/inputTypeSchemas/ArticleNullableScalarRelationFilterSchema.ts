import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleWhereInputSchema } from './ArticleWhereInputSchema';

export const ArticleNullableScalarRelationFilterSchema: z.ZodType<Prisma.ArticleNullableScalarRelationFilter> =
  z
    .object({
      is: z
        .lazy(() => ArticleWhereInputSchema)
        .optional()
        .nullable(),
      isNot: z
        .lazy(() => ArticleWhereInputSchema)
        .optional()
        .nullable(),
    })
    .strict();

export default ArticleNullableScalarRelationFilterSchema;
