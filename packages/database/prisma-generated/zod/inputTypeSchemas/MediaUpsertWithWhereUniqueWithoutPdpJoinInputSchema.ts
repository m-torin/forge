import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutPdpJoinInputSchema } from './MediaUpdateWithoutPdpJoinInputSchema';
import { MediaUncheckedUpdateWithoutPdpJoinInputSchema } from './MediaUncheckedUpdateWithoutPdpJoinInputSchema';
import { MediaCreateWithoutPdpJoinInputSchema } from './MediaCreateWithoutPdpJoinInputSchema';
import { MediaUncheckedCreateWithoutPdpJoinInputSchema } from './MediaUncheckedCreateWithoutPdpJoinInputSchema';

export const MediaUpsertWithWhereUniqueWithoutPdpJoinInputSchema: z.ZodType<Prisma.MediaUpsertWithWhereUniqueWithoutPdpJoinInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => MediaUpdateWithoutPdpJoinInputSchema),
        z.lazy(() => MediaUncheckedUpdateWithoutPdpJoinInputSchema),
      ]),
      create: z.union([
        z.lazy(() => MediaCreateWithoutPdpJoinInputSchema),
        z.lazy(() => MediaUncheckedCreateWithoutPdpJoinInputSchema),
      ]),
    })
    .strict();

export default MediaUpsertWithWhereUniqueWithoutPdpJoinInputSchema;
