import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutUserInputSchema } from './MediaCreateWithoutUserInputSchema';
import { MediaUncheckedCreateWithoutUserInputSchema } from './MediaUncheckedCreateWithoutUserInputSchema';
import { MediaCreateOrConnectWithoutUserInputSchema } from './MediaCreateOrConnectWithoutUserInputSchema';
import { MediaUpsertWithWhereUniqueWithoutUserInputSchema } from './MediaUpsertWithWhereUniqueWithoutUserInputSchema';
import { MediaCreateManyUserInputEnvelopeSchema } from './MediaCreateManyUserInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithWhereUniqueWithoutUserInputSchema } from './MediaUpdateWithWhereUniqueWithoutUserInputSchema';
import { MediaUpdateManyWithWhereWithoutUserInputSchema } from './MediaUpdateManyWithWhereWithoutUserInputSchema';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';

export const MediaUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.MediaUncheckedUpdateManyWithoutUserNestedInput> =
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
      upsert: z
        .union([
          z.lazy(() => MediaUpsertWithWhereUniqueWithoutUserInputSchema),
          z.lazy(() => MediaUpsertWithWhereUniqueWithoutUserInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => MediaCreateManyUserInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => MediaWhereUniqueInputSchema),
          z.lazy(() => MediaWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => MediaWhereUniqueInputSchema),
          z.lazy(() => MediaWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => MediaWhereUniqueInputSchema),
          z.lazy(() => MediaWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => MediaWhereUniqueInputSchema),
          z.lazy(() => MediaWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => MediaUpdateWithWhereUniqueWithoutUserInputSchema),
          z.lazy(() => MediaUpdateWithWhereUniqueWithoutUserInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => MediaUpdateManyWithWhereWithoutUserInputSchema),
          z.lazy(() => MediaUpdateManyWithWhereWithoutUserInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => MediaScalarWhereInputSchema),
          z.lazy(() => MediaScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default MediaUncheckedUpdateManyWithoutUserNestedInputSchema;
