import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateWithoutCollectionInputSchema } from './MediaCreateWithoutCollectionInputSchema';
import { MediaUncheckedCreateWithoutCollectionInputSchema } from './MediaUncheckedCreateWithoutCollectionInputSchema';
import { MediaCreateOrConnectWithoutCollectionInputSchema } from './MediaCreateOrConnectWithoutCollectionInputSchema';
import { MediaUpsertWithWhereUniqueWithoutCollectionInputSchema } from './MediaUpsertWithWhereUniqueWithoutCollectionInputSchema';
import { MediaCreateManyCollectionInputEnvelopeSchema } from './MediaCreateManyCollectionInputEnvelopeSchema';
import { MediaWhereUniqueInputSchema } from './MediaWhereUniqueInputSchema';
import { MediaUpdateWithWhereUniqueWithoutCollectionInputSchema } from './MediaUpdateWithWhereUniqueWithoutCollectionInputSchema';
import { MediaUpdateManyWithWhereWithoutCollectionInputSchema } from './MediaUpdateManyWithWhereWithoutCollectionInputSchema';
import { MediaScalarWhereInputSchema } from './MediaScalarWhereInputSchema';

export const MediaUpdateManyWithoutCollectionNestedInputSchema: z.ZodType<Prisma.MediaUpdateManyWithoutCollectionNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => MediaCreateWithoutCollectionInputSchema),
          z.lazy(() => MediaCreateWithoutCollectionInputSchema).array(),
          z.lazy(() => MediaUncheckedCreateWithoutCollectionInputSchema),
          z.lazy(() => MediaUncheckedCreateWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => MediaCreateOrConnectWithoutCollectionInputSchema),
          z.lazy(() => MediaCreateOrConnectWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => MediaUpsertWithWhereUniqueWithoutCollectionInputSchema),
          z.lazy(() => MediaUpsertWithWhereUniqueWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => MediaCreateManyCollectionInputEnvelopeSchema).optional(),
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
          z.lazy(() => MediaUpdateWithWhereUniqueWithoutCollectionInputSchema),
          z.lazy(() => MediaUpdateWithWhereUniqueWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => MediaUpdateManyWithWhereWithoutCollectionInputSchema),
          z.lazy(() => MediaUpdateManyWithWhereWithoutCollectionInputSchema).array(),
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

export default MediaUpdateManyWithoutCollectionNestedInputSchema;
