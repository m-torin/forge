import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';
import { MediaUpdateManyMutationInputSchema } from './MediaUpdateManyMutationInputSchema';
import { MediaUncheckedUpdateManyWithoutBrandInputSchema } from './MediaUncheckedUpdateManyWithoutBrandInputSchema';

export const MediaUpdateManyWithWhereWithoutBrandInputSchema: z.ZodType<Prisma.MediaUpdateManyWithWhereWithoutBrandInput> =
  z
    .object({
      where: z.lazy(() => MediaScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => MediaUpdateManyMutationInputSchema),
        z.lazy(() => MediaUncheckedUpdateManyWithoutBrandInputSchema),
      ]),
    })
    .strict();

export default MediaUpdateManyWithWhereWithoutBrandInputSchema;
