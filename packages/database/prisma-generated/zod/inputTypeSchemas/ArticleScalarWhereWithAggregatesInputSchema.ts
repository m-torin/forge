import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { JsonWithAggregatesFilterSchema } from './JsonWithAggregatesFilterSchema';
import { EnumContentStatusWithAggregatesFilterSchema } from './EnumContentStatusWithAggregatesFilterSchema';
import { ContentStatusSchema } from './ContentStatusSchema';

export const ArticleScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ArticleScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => ArticleScalarWhereWithAggregatesInputSchema),
          z.lazy(() => ArticleScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => ArticleScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => ArticleScalarWhereWithAggregatesInputSchema),
          z.lazy(() => ArticleScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      createdAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      updatedAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      deletedAt: z
        .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      deletedById: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      title: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      slug: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      content: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
      status: z
        .union([
          z.lazy(() => EnumContentStatusWithAggregatesFilterSchema),
          z.lazy(() => ContentStatusSchema),
        ])
        .optional(),
      userId: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
    })
    .strict();

export default ArticleScalarWhereWithAggregatesInputSchema;
