import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithoutUserInputSchema } from './MediaUpdateWithoutUserInputSchema';
import { MediaUncheckedUpdateWithoutUserInputSchema } from './MediaUncheckedUpdateWithoutUserInputSchema';

export const MediaUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.MediaUpdateWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => MediaUpdateWithoutUserInputSchema),
        z.lazy(() => MediaUncheckedUpdateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default MediaUpdateWithWhereUniqueWithoutUserInputSchema;
