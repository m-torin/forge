import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';
import { MediaUpdateManyMutationInputSchema } from './MediaUpdateManyMutationInputSchema';
import { MediaUncheckedUpdateManyWithoutDeletedByInputSchema } from './MediaUncheckedUpdateManyWithoutDeletedByInputSchema';

export const MediaUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.MediaUpdateManyWithWhereWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => MediaScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => MediaUpdateManyMutationInputSchema),
        z.lazy(() => MediaUncheckedUpdateManyWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default MediaUpdateManyWithWhereWithoutDeletedByInputSchema;
