import type { Prisma } from '../../client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { MediaUncheckedCreateNestedManyWithoutArticleInputSchema } from './MediaUncheckedCreateNestedManyWithoutArticleInputSchema';

export const ArticleUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.ArticleUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable(),
  title: z.string(),
  slug: z.string(),
  content: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  status: z.lazy(() => ContentStatusSchema).optional(),
  media: z.lazy(() => MediaUncheckedCreateNestedManyWithoutArticleInputSchema).optional()
}).strict();

export default ArticleUncheckedCreateWithoutUserInputSchema;
