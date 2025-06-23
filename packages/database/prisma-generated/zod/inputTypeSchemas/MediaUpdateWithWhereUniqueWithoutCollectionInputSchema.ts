import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutCollectionInputSchema } from './MediaUpdateWithoutCollectionInputSchema';
import { MediaUncheckedUpdateWithoutCollectionInputSchema } from './MediaUncheckedUpdateWithoutCollectionInputSchema';

export const MediaUpdateWithWhereUniqueWithoutCollectionInputSchema: z.ZodType<Prisma.MediaUpdateWithWhereUniqueWithoutCollectionInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => MediaUpdateWithoutCollectionInputSchema),
        z.lazy(() => MediaUncheckedUpdateWithoutCollectionInputSchema),
      ]),
    })
    .strict();

export default MediaUpdateWithWhereUniqueWithoutCollectionInputSchema;
