import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { EnumContentStatusFilterSchema } from './EnumContentStatusFilterSchema';
import { ContentStatusSchema } from './ContentStatusSchema';

export const ArticleScalarWhereInputSchema: z.ZodType<Prisma.ArticleScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => ArticleScalarWhereInputSchema),
        z.lazy(() => ArticleScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => ArticleScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => ArticleScalarWhereInputSchema),
        z.lazy(() => ArticleScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    deletedById: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    title: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    slug: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    content: z.lazy(() => JsonFilterSchema).optional(),
    status: z
      .union([z.lazy(() => EnumContentStatusFilterSchema), z.lazy(() => ContentStatusSchema)])
      .optional(),
    userId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
  })
  .strict();

export default ArticleScalarWhereInputSchema;
