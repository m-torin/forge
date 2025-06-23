import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaCreateWithoutDeletedByInputSchema } from './MediaCreateWithoutDeletedByInputSchema';
import { MediaUncheckedCreateWithoutDeletedByInputSchema } from './MediaUncheckedCreateWithoutDeletedByInputSchema';

export const MediaCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.MediaCreateOrConnectWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => MediaWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => MediaCreateWithoutDeletedByInputSchema),
        z.lazy(() => MediaUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default MediaCreateOrConnectWithoutDeletedByInputSchema;
