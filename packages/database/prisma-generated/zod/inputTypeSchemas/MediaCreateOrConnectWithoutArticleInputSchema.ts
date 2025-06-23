import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaCreateWithoutArticleInputSchema } from './MediaCreateWithoutArticleInputSchema';
import { MediaUncheckedCreateWithoutArticleInputSchema } from './MediaUncheckedCreateWithoutArticleInputSchema';

export const MediaCreateOrConnectWithoutArticleInputSchema: z.ZodType<Prisma.MediaCreateOrConnectWithoutArticleInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => MediaCreateWithoutArticleInputSchema),
        z.lazy(() => MediaUncheckedCreateWithoutArticleInputSchema),
      ]),
    })
    .strict();

export default MediaCreateOrConnectWithoutArticleInputSchema;
