import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';
import { MediaUpdateManyMutationInputSchema } from './MediaUpdateManyMutationInputSchema';
import { MediaUncheckedUpdateManyWithoutProductInputSchema } from './MediaUncheckedUpdateManyWithoutProductInputSchema';

export const MediaUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.MediaUpdateManyWithWhereWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => MediaScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => MediaUpdateManyMutationInputSchema),
        z.lazy(() => MediaUncheckedUpdateManyWithoutProductInputSchema),
      ]),
    })
    .strict();

export default MediaUpdateManyWithWhereWithoutProductInputSchema;
