import type { Prisma } from '../../client';

import { z } from 'zod';
import { ArticleWhereInputSchema } from './ArticleWhereInputSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { EnumContentStatusFilterSchema } from './EnumContentStatusFilterSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { MediaListRelationFilterSchema } from './MediaListRelationFilterSchema';

export const ArticleWhereUniqueInputSchema: z.ZodType<Prisma.ArticleWhereUniqueInput> = z
  .union([
    z.object({
      id: z.string().cuid(),
      slug: z.string(),
    }),
    z.object({
      id: z.string().cuid(),
    }),
    z.object({
      slug: z.string(),
    }),
  ])
  .and(
    z
      .object({
        id: z.string().cuid().optional(),
        slug: z.string().optional(),
        AND: z
          .union([
            z.lazy(() => ArticleWhereInputSchema),
            z.lazy(() => ArticleWhereInputSchema).array(),
          ])
          .optional(),
        OR: z
          .lazy(() => ArticleWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([
            z.lazy(() => ArticleWhereInputSchema),
            z.lazy(() => ArticleWhereInputSchema).array(),
          ])
          .optional(),
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
        content: z.lazy(() => JsonFilterSchema).optional(),
        status: z
          .union([z.lazy(() => EnumContentStatusFilterSchema), z.lazy(() => ContentStatusSchema)])
          .optional(),
        userId: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        deletedBy: z
          .union([
            z.lazy(() => UserNullableScalarRelationFilterSchema),
            z.lazy(() => UserWhereInputSchema),
          ])
          .optional()
          .nullable(),
        user: z
          .union([
            z.lazy(() => UserNullableScalarRelationFilterSchema),
            z.lazy(() => UserWhereInputSchema),
          ])
          .optional()
          .nullable(),
        media: z.lazy(() => MediaListRelationFilterSchema).optional(),
      })
      .strict(),
  );

export default ArticleWhereUniqueInputSchema;
