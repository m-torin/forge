import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutArticleInputSchema } from './MediaUpdateWithoutArticleInputSchema';
import { MediaUncheckedUpdateWithoutArticleInputSchema } from './MediaUncheckedUpdateWithoutArticleInputSchema';

export const MediaUpdateWithWhereUniqueWithoutArticleInputSchema: z.ZodType<Prisma.MediaUpdateWithWhereUniqueWithoutArticleInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => MediaUpdateWithoutArticleInputSchema),
        z.lazy(() => MediaUncheckedUpdateWithoutArticleInputSchema),
      ]),
    })
    .strict();

export default MediaUpdateWithWhereUniqueWithoutArticleInputSchema;
