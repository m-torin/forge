import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { UserCreateNestedOneWithoutDeletedArticlesInputSchema } from './UserCreateNestedOneWithoutDeletedArticlesInputSchema';
import { MediaCreateNestedManyWithoutArticleInputSchema } from './MediaCreateNestedManyWithoutArticleInputSchema';

export const ArticleCreateWithoutUserInputSchema: z.ZodType<Prisma.ArticleCreateWithoutUserInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      deletedAt: z.coerce.date().optional().nullable(),
      title: z.string(),
      slug: z.string(),
      content: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]),
      status: z.lazy(() => ContentStatusSchema).optional(),
      deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedArticlesInputSchema).optional(),
      media: z.lazy(() => MediaCreateNestedManyWithoutArticleInputSchema).optional(),
    })
    .strict();

export default ArticleCreateWithoutUserInputSchema;
