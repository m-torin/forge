import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutProductInputSchema } from './MediaUpdateWithoutProductInputSchema';
import { MediaUncheckedUpdateWithoutProductInputSchema } from './MediaUncheckedUpdateWithoutProductInputSchema';
import { MediaCreateWithoutProductInputSchema } from './MediaCreateWithoutProductInputSchema';
import { MediaUncheckedCreateWithoutProductInputSchema } from './MediaUncheckedCreateWithoutProductInputSchema';

export const MediaUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.MediaUpsertWithWhereUniqueWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => MediaUpdateWithoutProductInputSchema),
        z.lazy(() => MediaUncheckedUpdateWithoutProductInputSchema),
      ]),
      create: z.union([
        z.lazy(() => MediaCreateWithoutProductInputSchema),
        z.lazy(() => MediaUncheckedCreateWithoutProductInputSchema),
      ]),
    })
    .strict();

export default MediaUpsertWithWhereUniqueWithoutProductInputSchema;
