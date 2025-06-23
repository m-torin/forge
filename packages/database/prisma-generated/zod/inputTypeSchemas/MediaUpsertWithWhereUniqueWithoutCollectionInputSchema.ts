import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutCollectionInputSchema } from './MediaUpdateWithoutCollectionInputSchema';
import { MediaUncheckedUpdateWithoutCollectionInputSchema } from './MediaUncheckedUpdateWithoutCollectionInputSchema';
import { MediaCreateWithoutCollectionInputSchema } from './MediaCreateWithoutCollectionInputSchema';
import { MediaUncheckedCreateWithoutCollectionInputSchema } from './MediaUncheckedCreateWithoutCollectionInputSchema';

export const MediaUpsertWithWhereUniqueWithoutCollectionInputSchema: z.ZodType<Prisma.MediaUpsertWithWhereUniqueWithoutCollectionInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => MediaUpdateWithoutCollectionInputSchema),
        z.lazy(() => MediaUncheckedUpdateWithoutCollectionInputSchema),
      ]),
      create: z.union([
        z.lazy(() => MediaCreateWithoutCollectionInputSchema),
        z.lazy(() => MediaUncheckedCreateWithoutCollectionInputSchema),
      ]),
    })
    .strict();

export default MediaUpsertWithWhereUniqueWithoutCollectionInputSchema;
