import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { EnumContentStatusFilterSchema } from './EnumContentStatusFilterSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { EnumReviewTypeFilterSchema } from './EnumReviewTypeFilterSchema';
import { ReviewTypeSchema } from './ReviewTypeSchema';

export const ReviewScalarWhereInputSchema: z.ZodType<Prisma.ReviewScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => ReviewScalarWhereInputSchema),
        z.lazy(() => ReviewScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => ReviewScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => ReviewScalarWhereInputSchema),
        z.lazy(() => ReviewScalarWhereInputSchema).array(),
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
    title: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    content: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    rating: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    status: z
      .union([z.lazy(() => EnumContentStatusFilterSchema), z.lazy(() => ContentStatusSchema)])
      .optional(),
    verified: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
    type: z
      .union([z.lazy(() => EnumReviewTypeFilterSchema), z.lazy(() => ReviewTypeSchema)])
      .optional(),
    sourceId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    source: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    helpfulCount: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    totalVotes: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    productId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
  })
  .strict();

export default ReviewScalarWhereInputSchema;
