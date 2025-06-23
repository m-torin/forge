import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { EnumContentStatusFieldUpdateOperationsInputSchema } from './EnumContentStatusFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { ReviewTypeSchema } from './ReviewTypeSchema';
import { EnumReviewTypeFieldUpdateOperationsInputSchema } from './EnumReviewTypeFieldUpdateOperationsInputSchema';
import { MediaUncheckedUpdateManyWithoutReviewNestedInputSchema } from './MediaUncheckedUpdateManyWithoutReviewNestedInputSchema';
import { ReviewVoteJoinUncheckedUpdateManyWithoutReviewNestedInputSchema } from './ReviewVoteJoinUncheckedUpdateManyWithoutReviewNestedInputSchema';

export const ReviewUncheckedUpdateInputSchema: z.ZodType<Prisma.ReviewUncheckedUpdateInput> = z
  .object({
    id: z
      .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    deletedById: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    title: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    content: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    rating: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    status: z
      .union([
        z.lazy(() => ContentStatusSchema),
        z.lazy(() => EnumContentStatusFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    verified: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
    type: z
      .union([
        z.lazy(() => ReviewTypeSchema),
        z.lazy(() => EnumReviewTypeFieldUpdateOperationsInputSchema),
      ])
      .optional(),
    sourceId: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    source: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    helpfulCount: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    totalVotes: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    userId: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
    productId: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    media: z.lazy(() => MediaUncheckedUpdateManyWithoutReviewNestedInputSchema).optional(),
    votes: z.lazy(() => ReviewVoteJoinUncheckedUpdateManyWithoutReviewNestedInputSchema).optional(),
  })
  .strict();

export default ReviewUncheckedUpdateInputSchema;
