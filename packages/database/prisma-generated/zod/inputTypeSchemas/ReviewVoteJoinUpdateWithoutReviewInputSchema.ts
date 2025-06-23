import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { VoteTypeSchema } from './VoteTypeSchema';
import { EnumVoteTypeFieldUpdateOperationsInputSchema } from './EnumVoteTypeFieldUpdateOperationsInputSchema';
import { UserUpdateOneRequiredWithoutReviewVotesNestedInputSchema } from './UserUpdateOneRequiredWithoutReviewVotesNestedInputSchema';

export const ReviewVoteJoinUpdateWithoutReviewInputSchema: z.ZodType<Prisma.ReviewVoteJoinUpdateWithoutReviewInput> =
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
      user: z.lazy(() => UserUpdateOneRequiredWithoutReviewVotesNestedInputSchema).optional(),
    })
    .strict();

export default ReviewVoteJoinUpdateWithoutReviewInputSchema;
