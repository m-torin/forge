import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { VoteTypeSchema } from './VoteTypeSchema';
import { EnumVoteTypeFieldUpdateOperationsInputSchema } from './EnumVoteTypeFieldUpdateOperationsInputSchema';

export const ReviewVoteJoinUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ReviewVoteJoinUncheckedUpdateManyInput> =
  z
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
      voteType: z
        .union([
          z.lazy(() => VoteTypeSchema),
          z.lazy(() => EnumVoteTypeFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      userId: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      reviewId: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
    })
    .strict();

export default ReviewVoteJoinUncheckedUpdateManyInputSchema;
