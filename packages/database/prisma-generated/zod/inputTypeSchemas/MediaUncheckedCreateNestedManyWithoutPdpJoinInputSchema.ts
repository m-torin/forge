import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutPdpJoinInputSchema } from './MediaCreateWithoutPdpJoinInputSchema';
import { MediaUncheckedCreateWithoutPdpJoinInputSchema } from './MediaUncheckedCreateWithoutPdpJoinInputSchema';
import { MediaCreateOrConnectWithoutPdpJoinInputSchema } from './MediaCreateOrConnectWithoutPdpJoinInputSchema';
import { MediaCreateManyPdpJoinInputEnvelopeSchema } from './MediaCreateManyPdpJoinInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';

export const MediaUncheckedCreateNestedManyWithoutPdpJoinInputSchema: z.ZodType<Prisma.MediaUncheckedCreateNestedManyWithoutPdpJoinInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => MediaCreateWithoutPdpJoinInputSchema),
          z.lazy(() => MediaCreateWithoutPdpJoinInputSchema).array(),
          z.lazy(() => MediaUncheckedCreateWithoutPdpJoinInputSchema),
          z.lazy(() => MediaUncheckedCreateWithoutPdpJoinInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => MediaCreateOrConnectWithoutPdpJoinInputSchema),
          z.lazy(() => MediaCreateOrConnectWithoutPdpJoinInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => MediaCreateManyPdpJoinInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => MediaWhereUniqueInputSchema),
          z.lazy(() => MediaWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default MediaUncheckedCreateNestedManyWithoutPdpJoinInputSchema;
