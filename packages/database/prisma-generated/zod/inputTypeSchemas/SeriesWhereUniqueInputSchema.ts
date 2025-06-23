import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereInputSchema } from './SeriesWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { FandomScalarRelationFilterSchema } from './FandomScalarRelationFilterSchema';
import { FandomWhereInputSchema } from './FandomWhereInputSchema';
import { StoryListRelationFilterSchema } from './StoryListRelationFilterSchema';
import { ProductListRelationFilterSchema } from './ProductListRelationFilterSchema';
import { JrFindReplaceRejectListRelationFilterSchema } from './JrFindReplaceRejectListRelationFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const SeriesWhereUniqueInputSchema: z.ZodType<Prisma.SeriesWhereUniqueInput> = z
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
            z.lazy(() => SeriesWhereInputSchema),
            z.lazy(() => SeriesWhereInputSchema).array(),
          ])
          .optional(),
        OR: z
          .lazy(() => SeriesWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([
            z.lazy(() => SeriesWhereInputSchema),
            z.lazy(() => SeriesWhereInputSchema).array(),
          ])
          .optional(),
        name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        fandomId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        displayOrder: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
        isFictional: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
        copy: z.lazy(() => JsonFilterSchema).optional(),
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
        fandom: z
          .union([
            z.lazy(() => FandomScalarRelationFilterSchema),
            z.lazy(() => FandomWhereInputSchema),
          ])
          .optional(),
        stories: z.lazy(() => StoryListRelationFilterSchema).optional(),
        products: z.lazy(() => ProductListRelationFilterSchema).optional(),
        jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectListRelationFilterSchema).optional(),
        deletedBy: z
          .union([
            z.lazy(() => UserNullableScalarRelationFilterSchema),
            z.lazy(() => UserWhereInputSchema),
          ])
          .optional()
          .nullable(),
      })
      .strict(),
  );

export default SeriesWhereUniqueInputSchema;
