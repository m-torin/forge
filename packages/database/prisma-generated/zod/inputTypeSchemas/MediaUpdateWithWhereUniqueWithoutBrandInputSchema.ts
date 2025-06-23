import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutBrandInputSchema } from './MediaUpdateWithoutBrandInputSchema';
import { MediaUncheckedUpdateWithoutBrandInputSchema } from './MediaUncheckedUpdateWithoutBrandInputSchema';

export const MediaUpdateWithWhereUniqueWithoutBrandInputSchema: z.ZodType<Prisma.MediaUpdateWithWhereUniqueWithoutBrandInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => MediaUpdateWithoutBrandInputSchema),
        z.lazy(() => MediaUncheckedUpdateWithoutBrandInputSchema),
      ]),
    })
    .strict();

export default MediaUpdateWithWhereUniqueWithoutBrandInputSchema;
