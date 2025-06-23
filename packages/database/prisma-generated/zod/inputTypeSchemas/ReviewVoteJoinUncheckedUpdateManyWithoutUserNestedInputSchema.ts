import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinCreateWithoutUserInputSchema } from './ReviewVoteJoinCreateWithoutUserInputSchema';
import { ReviewVoteJoinUncheckedCreateWithoutUserInputSchema } from './ReviewVoteJoinUncheckedCreateWithoutUserInputSchema';
import { ReviewVoteJoinCreateOrConnectWithoutUserInputSchema } from './ReviewVoteJoinCreateOrConnectWithoutUserInputSchema';
import { ReviewVoteJoinUpsertWithWhereUniqueWithoutUserInputSchema } from './ReviewVoteJoinUpsertWithWhereUniqueWithoutUserInputSchema';
import { ReviewVoteJoinCreateManyUserInputEnvelopeSchema } from './ReviewVoteJoinCreateManyUserInputEnvelopeSchema';
import { ReviewVoteJoinWhereUniqueInputSchema } from './ReviewVoteJoinWhereUniqueInputSchema';
import { ReviewVoteJoinUpdateWithWhereUniqueWithoutUserInputSchema } from './ReviewVoteJoinUpdateWithWhereUniqueWithoutUserInputSchema';
import { ReviewVoteJoinUpdateManyWithWhereWithoutUserInputSchema } from './ReviewVoteJoinUpdateManyWithWhereWithoutUserInputSchema';
import { ReviewVoteJoinScalarWhereInputSchema } from './ReviewVoteJoinScalarWhereInputSchema';

export const ReviewVoteJoinUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.ReviewVoteJoinUncheckedUpdateManyWithoutUserNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ReviewVoteJoinCreateWithoutUserInputSchema),
          z.lazy(() => ReviewVoteJoinCreateWithoutUserInputSchema).array(),
          z.lazy(() => ReviewVoteJoinUncheckedCreateWithoutUserInputSchema),
          z.lazy(() => ReviewVoteJoinUncheckedCreateWithoutUserInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ReviewVoteJoinCreateOrConnectWithoutUserInputSchema),
          z.lazy(() => ReviewVoteJoinCreateOrConnectWithoutUserInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => ReviewVoteJoinUpsertWithWhereUniqueWithoutUserInputSchema),
          z.lazy(() => ReviewVoteJoinUpsertWithWhereUniqueWithoutUserInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ReviewVoteJoinCreateManyUserInputEnvelopeSchema).optional(),
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
          z.lazy(() => ReviewVoteJoinUpdateWithWhereUniqueWithoutUserInputSchema),
          z.lazy(() => ReviewVoteJoinUpdateWithWhereUniqueWithoutUserInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ReviewVoteJoinUpdateManyWithWhereWithoutUserInputSchema),
          z.lazy(() => ReviewVoteJoinUpdateManyWithWhereWithoutUserInputSchema).array(),
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

export default ReviewVoteJoinUncheckedUpdateManyWithoutUserNestedInputSchema;
