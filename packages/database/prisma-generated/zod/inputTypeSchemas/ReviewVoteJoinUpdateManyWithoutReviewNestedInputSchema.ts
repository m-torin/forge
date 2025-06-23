import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinCreateWithoutReviewInputSchema } from './ReviewVoteJoinCreateWithoutReviewInputSchema';
import { ReviewVoteJoinUncheckedCreateWithoutReviewInputSchema } from './ReviewVoteJoinUncheckedCreateWithoutReviewInputSchema';
import { ReviewVoteJoinCreateOrConnectWithoutReviewInputSchema } from './ReviewVoteJoinCreateOrConnectWithoutReviewInputSchema';
import { ReviewVoteJoinUpsertWithWhereUniqueWithoutReviewInputSchema } from './ReviewVoteJoinUpsertWithWhereUniqueWithoutReviewInputSchema';
import { ReviewVoteJoinCreateManyReviewInputEnvelopeSchema } from './ReviewVoteJoinCreateManyReviewInputEnvelopeSchema';
import { ReviewVoteJoinWhereUniqueInputSchema } from './ReviewVoteJoinWhereUniqueInputSchema';
import { ReviewVoteJoinUpdateWithWhereUniqueWithoutReviewInputSchema } from './ReviewVoteJoinUpdateWithWhereUniqueWithoutReviewInputSchema';
import { ReviewVoteJoinUpdateManyWithWhereWithoutReviewInputSchema } from './ReviewVoteJoinUpdateManyWithWhereWithoutReviewInputSchema';
import { ReviewVoteJoinScalarWhereInputSchema } from './ReviewVoteJoinScalarWhereInputSchema';

export const ReviewVoteJoinUpdateManyWithoutReviewNestedInputSchema: z.ZodType<Prisma.ReviewVoteJoinUpdateManyWithoutReviewNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ReviewVoteJoinCreateWithoutReviewInputSchema),
          z.lazy(() => ReviewVoteJoinCreateWithoutReviewInputSchema).array(),
          z.lazy(() => ReviewVoteJoinUncheckedCreateWithoutReviewInputSchema),
          z.lazy(() => ReviewVoteJoinUncheckedCreateWithoutReviewInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ReviewVoteJoinCreateOrConnectWithoutReviewInputSchema),
          z.lazy(() => ReviewVoteJoinCreateOrConnectWithoutReviewInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => ReviewVoteJoinUpsertWithWhereUniqueWithoutReviewInputSchema),
          z.lazy(() => ReviewVoteJoinUpsertWithWhereUniqueWithoutReviewInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ReviewVoteJoinCreateManyReviewInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema),
          z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema),
          z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema),
          z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema),
          z.lazy(() => ReviewVoteJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => ReviewVoteJoinUpdateWithWhereUniqueWithoutReviewInputSchema),
          z.lazy(() => ReviewVoteJoinUpdateWithWhereUniqueWithoutReviewInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ReviewVoteJoinUpdateManyWithWhereWithoutReviewInputSchema),
          z.lazy(() => ReviewVoteJoinUpdateManyWithWhereWithoutReviewInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => ReviewVoteJoinScalarWhereInputSchema),
          z.lazy(() => ReviewVoteJoinScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ReviewVoteJoinUpdateManyWithoutReviewNestedInputSchema;
