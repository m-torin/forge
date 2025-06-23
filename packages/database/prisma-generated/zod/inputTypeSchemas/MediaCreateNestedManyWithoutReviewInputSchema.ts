import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutReviewInputSchema } from './MediaCreateWithoutReviewInputSchema';
import { MediaUncheckedCreateWithoutReviewInputSchema } from './MediaUncheckedCreateWithoutReviewInputSchema';
import { MediaCreateOrConnectWithoutReviewInputSchema } from './MediaCreateOrConnectWithoutReviewInputSchema';
import { MediaCreateManyReviewInputEnvelopeSchema } from './MediaCreateManyReviewInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';

export const MediaCreateNestedManyWithoutReviewInputSchema: z.ZodType<Prisma.MediaCreateNestedManyWithoutReviewInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => MediaCreateWithoutReviewInputSchema),
          z.lazy(() => MediaCreateWithoutReviewInputSchema).array(),
          z.lazy(() => MediaUncheckedCreateWithoutReviewInputSchema),
          z.lazy(() => MediaUncheckedCreateWithoutReviewInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => MediaCreateOrConnectWithoutReviewInputSchema),
          z.lazy(() => MediaCreateOrConnectWithoutReviewInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => MediaCreateManyReviewInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => MediaWhereUniqueInputSchema),
          z.lazy(() => MediaWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default MediaCreateNestedManyWithoutReviewInputSchema;
