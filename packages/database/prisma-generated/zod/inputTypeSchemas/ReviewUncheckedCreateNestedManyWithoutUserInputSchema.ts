import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewCreateWithoutUserInputSchema } from './ReviewCreateWithoutUserInputSchema';
import { ReviewUncheckedCreateWithoutUserInputSchema } from './ReviewUncheckedCreateWithoutUserInputSchema';
import { ReviewCreateOrConnectWithoutUserInputSchema } from './ReviewCreateOrConnectWithoutUserInputSchema';
import { ReviewCreateManyUserInputEnvelopeSchema } from './ReviewCreateManyUserInputEnvelopeSchema';
import { ReviewWhereUniqueInputSchema } from './ReviewWhereUniqueInputSchema';

export const ReviewUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateNestedManyWithoutUserInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ReviewCreateWithoutUserInputSchema),
          z.lazy(() => ReviewCreateWithoutUserInputSchema).array(),
          z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema),
          z.lazy(() => ReviewUncheckedCreateWithoutUserInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema),
          z.lazy(() => ReviewCreateOrConnectWithoutUserInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ReviewCreateManyUserInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => ReviewWhereUniqueInputSchema),
          z.lazy(() => ReviewWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ReviewUncheckedCreateNestedManyWithoutUserInputSchema;
