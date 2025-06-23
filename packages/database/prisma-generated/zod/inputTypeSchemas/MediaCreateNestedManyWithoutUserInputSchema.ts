import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutUserInputSchema } from './MediaCreateWithoutUserInputSchema';
import { MediaUncheckedCreateWithoutUserInputSchema } from './MediaUncheckedCreateWithoutUserInputSchema';
import { MediaCreateOrConnectWithoutUserInputSchema } from './MediaCreateOrConnectWithoutUserInputSchema';
import { MediaCreateManyUserInputEnvelopeSchema } from './MediaCreateManyUserInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';

export const MediaCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.MediaCreateNestedManyWithoutUserInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => MediaCreateWithoutUserInputSchema),
          z.lazy(() => MediaCreateWithoutUserInputSchema).array(),
          z.lazy(() => MediaUncheckedCreateWithoutUserInputSchema),
          z.lazy(() => MediaUncheckedCreateWithoutUserInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => MediaCreateOrConnectWithoutUserInputSchema),
          z.lazy(() => MediaCreateOrConnectWithoutUserInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => MediaCreateManyUserInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => MediaWhereUniqueInputSchema),
          z.lazy(() => MediaWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default MediaCreateNestedManyWithoutUserInputSchema;
