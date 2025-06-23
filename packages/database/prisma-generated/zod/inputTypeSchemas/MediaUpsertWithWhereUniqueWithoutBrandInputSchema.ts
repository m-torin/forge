import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutBrandInputSchema } from './MediaUpdateWithoutBrandInputSchema';
import { MediaUncheckedUpdateWithoutBrandInputSchema } from './MediaUncheckedUpdateWithoutBrandInputSchema';
import { MediaCreateWithoutBrandInputSchema } from './MediaCreateWithoutBrandInputSchema';
import { MediaUncheckedCreateWithoutBrandInputSchema } from './MediaUncheckedCreateWithoutBrandInputSchema';

export const MediaUpsertWithWhereUniqueWithoutBrandInputSchema: z.ZodType<Prisma.MediaUpsertWithWhereUniqueWithoutBrandInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => MediaUpdateWithoutBrandInputSchema),
        z.lazy(() => MediaUncheckedUpdateWithoutBrandInputSchema),
      ]),
      create: z.union([
        z.lazy(() => MediaCreateWithoutBrandInputSchema),
        z.lazy(() => MediaUncheckedCreateWithoutBrandInputSchema),
      ]),
    })
    .strict();

export default MediaUpsertWithWhereUniqueWithoutBrandInputSchema;
