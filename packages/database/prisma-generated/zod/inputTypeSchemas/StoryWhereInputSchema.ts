import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { SeriesNullableScalarRelationFilterSchema } from './SeriesNullableScalarRelationFilterSchema';
import { SeriesWhereInputSchema } from './SeriesWhereInputSchema';
import { FandomScalarRelationFilterSchema } from './FandomScalarRelationFilterSchema';
import { FandomWhereInputSchema } from './FandomWhereInputSchema';
import { ProductListRelationFilterSchema } from './ProductListRelationFilterSchema';
import { JrFindReplaceRejectListRelationFilterSchema } from './JrFindReplaceRejectListRelationFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const StoryWhereInputSchema: z.ZodType<Prisma.StoryWhereInput> = z
  .object({
    AND: z
      .union([z.lazy(() => StoryWhereInputSchema), z.lazy(() => StoryWhereInputSchema).array()])
      .optional(),
    OR: z
      .lazy(() => StoryWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([z.lazy(() => StoryWhereInputSchema), z.lazy(() => StoryWhereInputSchema).array()])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    slug: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    seriesId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    fandomId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    displayOrder: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
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
    series: z
      .union([
        z.lazy(() => SeriesNullableScalarRelationFilterSchema),
        z.lazy(() => SeriesWhereInputSchema),
      ])
      .optional()
      .nullable(),
    fandom: z
      .union([z.lazy(() => FandomScalarRelationFilterSchema), z.lazy(() => FandomWhereInputSchema)])
      .optional(),
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
  .strict();

export default StoryWhereInputSchema;
