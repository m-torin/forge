import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutReviewInputSchema } from './MediaUpdateWithoutReviewInputSchema';
import { MediaUncheckedUpdateWithoutReviewInputSchema } from './MediaUncheckedUpdateWithoutReviewInputSchema';
import { MediaCreateWithoutReviewInputSchema } from './MediaCreateWithoutReviewInputSchema';
import { MediaUncheckedCreateWithoutReviewInputSchema } from './MediaUncheckedCreateWithoutReviewInputSchema';

export const MediaUpsertWithWhereUniqueWithoutReviewInputSchema: z.ZodType<Prisma.MediaUpsertWithWhereUniqueWithoutReviewInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => MediaUpdateWithoutReviewInputSchema),
        z.lazy(() => MediaUncheckedUpdateWithoutReviewInputSchema),
      ]),
      create: z.union([
        z.lazy(() => MediaCreateWithoutReviewInputSchema),
        z.lazy(() => MediaUncheckedCreateWithoutReviewInputSchema),
      ]),
    })
    .strict();

export default MediaUpsertWithWhereUniqueWithoutReviewInputSchema;
