import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutArticleInputSchema } from './MediaUpdateWithoutArticleInputSchema';
import { MediaUncheckedUpdateWithoutArticleInputSchema } from './MediaUncheckedUpdateWithoutArticleInputSchema';
import { MediaCreateWithoutArticleInputSchema } from './MediaCreateWithoutArticleInputSchema';
import { MediaUncheckedCreateWithoutArticleInputSchema } from './MediaUncheckedCreateWithoutArticleInputSchema';

export const MediaUpsertWithWhereUniqueWithoutArticleInputSchema: z.ZodType<Prisma.MediaUpsertWithWhereUniqueWithoutArticleInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => MediaUpdateWithoutArticleInputSchema),
        z.lazy(() => MediaUncheckedUpdateWithoutArticleInputSchema),
      ]),
      create: z.union([
        z.lazy(() => MediaCreateWithoutArticleInputSchema),
        z.lazy(() => MediaUncheckedCreateWithoutArticleInputSchema),
      ]),
    })
    .strict();

export default MediaUpsertWithWhereUniqueWithoutArticleInputSchema;
