import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutDeletedByInputSchema } from './MediaCreateWithoutDeletedByInputSchema';
import { MediaUncheckedCreateWithoutDeletedByInputSchema } from './MediaUncheckedCreateWithoutDeletedByInputSchema';
import { MediaCreateOrConnectWithoutDeletedByInputSchema } from './MediaCreateOrConnectWithoutDeletedByInputSchema';
import { MediaCreateManyDeletedByInputEnvelopeSchema } from './MediaCreateManyDeletedByInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';

export const MediaUncheckedCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.MediaUncheckedCreateNestedManyWithoutDeletedByInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => MediaCreateWithoutDeletedByInputSchema),
          z.lazy(() => MediaCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => MediaUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => MediaUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => MediaCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => MediaCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => MediaCreateManyDeletedByInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => MediaWhereUniqueInputSchema),
          z.lazy(() => MediaWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default MediaUncheckedCreateNestedManyWithoutDeletedByInputSchema;
