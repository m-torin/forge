import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { EnumContentStatusWithAggregatesFilterSchema } from './EnumContentStatusWithAggregatesFilterSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';
import { EnumReviewTypeWithAggregatesFilterSchema } from './EnumReviewTypeWithAggregatesFilterSchema';
import { ReviewTypeSchema } from './ReviewTypeSchema';

export const ReviewScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ReviewScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema),
          z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => ReviewScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema),
          z.lazy(() => ReviewScalarWhereWithAggregatesInputSchema).array(),
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
      title: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      content: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      rating: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      status: z
        .union([
          z.lazy(() => EnumContentStatusWithAggregatesFilterSchema),
          z.lazy(() => ContentStatusSchema),
        ])
        .optional(),
      verified: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
      type: z
        .union([
          z.lazy(() => EnumReviewTypeWithAggregatesFilterSchema),
          z.lazy(() => ReviewTypeSchema),
        ])
        .optional(),
      sourceId: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      source: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      helpfulCount: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      totalVotes: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      userId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      productId: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
    })
    .strict();

export default ReviewScalarWhereWithAggregatesInputSchema;
