import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinCreateWithoutProductInputSchema } from './FavoriteJoinCreateWithoutProductInputSchema';
import { FavoriteJoinUncheckedCreateWithoutProductInputSchema } from './FavoriteJoinUncheckedCreateWithoutProductInputSchema';
import { FavoriteJoinCreateOrConnectWithoutProductInputSchema } from './FavoriteJoinCreateOrConnectWithoutProductInputSchema';
import { FavoriteJoinUpsertWithWhereUniqueWithoutProductInputSchema } from './FavoriteJoinUpsertWithWhereUniqueWithoutProductInputSchema';
import { FavoriteJoinCreateManyProductInputEnvelopeSchema } from './FavoriteJoinCreateManyProductInputEnvelopeSchema';
import { FavoriteJoinWhereUniqueInputSchema } from './FavoriteJoinWhereUniqueInputSchema';
import { FavoriteJoinUpdateWithWhereUniqueWithoutProductInputSchema } from './FavoriteJoinUpdateWithWhereUniqueWithoutProductInputSchema';
import { FavoriteJoinUpdateManyWithWhereWithoutProductInputSchema } from './FavoriteJoinUpdateManyWithWhereWithoutProductInputSchema';
import { FavoriteJoinScalarWhereInputSchema } from './FavoriteJoinScalarWhereInputSchema';

export const FavoriteJoinUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.FavoriteJoinUpdateManyWithoutProductNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => FavoriteJoinCreateWithoutProductInputSchema),
          z.lazy(() => FavoriteJoinCreateWithoutProductInputSchema).array(),
          z.lazy(() => FavoriteJoinUncheckedCreateWithoutProductInputSchema),
          z.lazy(() => FavoriteJoinUncheckedCreateWithoutProductInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => FavoriteJoinCreateOrConnectWithoutProductInputSchema),
          z.lazy(() => FavoriteJoinCreateOrConnectWithoutProductInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => FavoriteJoinUpsertWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => FavoriteJoinUpsertWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => FavoriteJoinCreateManyProductInputEnvelopeSchema).optional(),
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
          z.lazy(() => FavoriteJoinUpdateWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => FavoriteJoinUpdateWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => FavoriteJoinUpdateManyWithWhereWithoutProductInputSchema),
          z.lazy(() => FavoriteJoinUpdateManyWithWhereWithoutProductInputSchema).array(),
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

export default FavoriteJoinUpdateManyWithoutProductNestedInputSchema;
