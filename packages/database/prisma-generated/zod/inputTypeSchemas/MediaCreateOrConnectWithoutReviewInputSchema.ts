import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaCreateWithoutReviewInputSchema } from './MediaCreateWithoutReviewInputSchema';
import { MediaUncheckedCreateWithoutReviewInputSchema } from './MediaUncheckedCreateWithoutReviewInputSchema';

export const MediaCreateOrConnectWithoutReviewInputSchema: z.ZodType<Prisma.MediaCreateOrConnectWithoutReviewInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => MediaCreateWithoutReviewInputSchema),
        z.lazy(() => MediaUncheckedCreateWithoutReviewInputSchema),
      ]),
    })
    .strict();

export default MediaCreateOrConnectWithoutReviewInputSchema;
