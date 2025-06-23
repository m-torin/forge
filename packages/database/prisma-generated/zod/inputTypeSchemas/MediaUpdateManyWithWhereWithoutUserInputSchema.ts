import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';
import { MediaUpdateManyMutationInputSchema } from './MediaUpdateManyMutationInputSchema';
import { MediaUncheckedUpdateManyWithoutUserInputSchema } from './MediaUncheckedUpdateManyWithoutUserInputSchema';

export const MediaUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.MediaUpdateManyWithWhereWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => MediaScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => MediaUpdateManyMutationInputSchema),
        z.lazy(() => MediaUncheckedUpdateManyWithoutUserInputSchema),
      ]),
    })
    .strict();

export default MediaUpdateManyWithWhereWithoutUserInputSchema;
