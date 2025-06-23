import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinCreateWithoutCollectionInputSchema } from './FavoriteJoinCreateWithoutCollectionInputSchema';
import { FavoriteJoinUncheckedCreateWithoutCollectionInputSchema } from './FavoriteJoinUncheckedCreateWithoutCollectionInputSchema';
import { FavoriteJoinCreateOrConnectWithoutCollectionInputSchema } from './FavoriteJoinCreateOrConnectWithoutCollectionInputSchema';
import { FavoriteJoinUpsertWithWhereUniqueWithoutCollectionInputSchema } from './FavoriteJoinUpsertWithWhereUniqueWithoutCollectionInputSchema';
import { FavoriteJoinCreateManyCollectionInputEnvelopeSchema } from './FavoriteJoinCreateManyCollectionInputEnvelopeSchema';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';
import { FavoriteJoinUpdateWithWhereUniqueWithoutCollectionInputSchema } from './FavoriteJoinUpdateWithWhereUniqueWithoutCollectionInputSchema';
import { FavoriteJoinUpdateManyWithWhereWithoutCollectionInputSchema } from './FavoriteJoinUpdateManyWithWhereWithoutCollectionInputSchema';
import { FavoriteJoinScalarWhereInputSchema } from './FavoriteJoinScalarWhereInputSchema';

export const FavoriteJoinUncheckedUpdateManyWithoutCollectionNestedInputSchema: z.ZodType<Prisma.FavoriteJoinUncheckedUpdateManyWithoutCollectionNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => FavoriteJoinCreateWithoutCollectionInputSchema),
          z.lazy(() => FavoriteJoinCreateWithoutCollectionInputSchema).array(),
          z.lazy(() => FavoriteJoinUncheckedCreateWithoutCollectionInputSchema),
          z.lazy(() => FavoriteJoinUncheckedCreateWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => FavoriteJoinCreateOrConnectWithoutCollectionInputSchema),
          z.lazy(() => FavoriteJoinCreateOrConnectWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => FavoriteJoinUpsertWithWhereUniqueWithoutCollectionInputSchema),
          z.lazy(() => FavoriteJoinUpsertWithWhereUniqueWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => FavoriteJoinCreateManyCollectionInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => FavoriteJoinWhereUniqueInputSchema),
          z.lazy(() => FavoriteJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => FavoriteJoinWhereUniqueInputSchema),
          z.lazy(() => FavoriteJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => FavoriteJoinWhereUniqueInputSchema),
          z.lazy(() => FavoriteJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => FavoriteJoinWhereUniqueInputSchema),
          z.lazy(() => FavoriteJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => FavoriteJoinUpdateWithWhereUniqueWithoutCollectionInputSchema),
          z.lazy(() => FavoriteJoinUpdateWithWhereUniqueWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => FavoriteJoinUpdateManyWithWhereWithoutCollectionInputSchema),
          z.lazy(() => FavoriteJoinUpdateManyWithWhereWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => FavoriteJoinScalarWhereInputSchema),
          z.lazy(() => FavoriteJoinScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default FavoriteJoinUncheckedUpdateManyWithoutCollectionNestedInputSchema;
