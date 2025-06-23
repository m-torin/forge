import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutProductInputSchema } from './MediaCreateWithoutProductInputSchema';
import { MediaUncheckedCreateWithoutProductInputSchema } from './MediaUncheckedCreateWithoutProductInputSchema';
import { MediaCreateOrConnectWithoutProductInputSchema } from './MediaCreateOrConnectWithoutProductInputSchema';
import { MediaCreateManyProductInputEnvelopeSchema } from './MediaCreateManyProductInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';

export const MediaCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.MediaCreateNestedManyWithoutProductInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => MediaCreateWithoutProductInputSchema),
          z.lazy(() => MediaCreateWithoutProductInputSchema).array(),
          z.lazy(() => MediaUncheckedCreateWithoutProductInputSchema),
          z.lazy(() => MediaUncheckedCreateWithoutProductInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => MediaCreateOrConnectWithoutProductInputSchema),
          z.lazy(() => MediaCreateOrConnectWithoutProductInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => MediaCreateManyProductInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => MediaWhereUniqueInputSchema),
          z.lazy(() => MediaWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default MediaCreateNestedManyWithoutProductInputSchema;
