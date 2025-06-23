import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutProductInputSchema } from './PdpJoinCreateWithoutProductInputSchema';
import { PdpJoinUncheckedCreateWithoutProductInputSchema } from './PdpJoinUncheckedCreateWithoutProductInputSchema';
import { PdpJoinCreateOrConnectWithoutProductInputSchema } from './PdpJoinCreateOrConnectWithoutProductInputSchema';
import { PdpJoinUpsertWithWhereUniqueWithoutProductInputSchema } from './PdpJoinUpsertWithWhereUniqueWithoutProductInputSchema';
import { PdpJoinCreateManyProductInputEnvelopeSchema } from './PdpJoinCreateManyProductInputEnvelopeSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithWhereUniqueWithoutProductInputSchema } from './PdpJoinUpdateWithWhereUniqueWithoutProductInputSchema';
import { PdpJoinUpdateManyWithWhereWithoutProductInputSchema } from './PdpJoinUpdateManyWithWhereWithoutProductInputSchema';
import { PdpJoinScalarWhereInputSchema } from './PdpJoinScalarWhereInputSchema';

export const PdpJoinUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.PdpJoinUpdateManyWithoutProductNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => PdpJoinCreateWithoutProductInputSchema),
          z.lazy(() => PdpJoinCreateWithoutProductInputSchema).array(),
          z.lazy(() => PdpJoinUncheckedCreateWithoutProductInputSchema),
          z.lazy(() => PdpJoinUncheckedCreateWithoutProductInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => PdpJoinCreateOrConnectWithoutProductInputSchema),
          z.lazy(() => PdpJoinCreateOrConnectWithoutProductInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => PdpJoinUpsertWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => PdpJoinUpsertWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => PdpJoinCreateManyProductInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => PdpJoinWhereUniqueInputSchema),
          z.lazy(() => PdpJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => PdpJoinWhereUniqueInputSchema),
          z.lazy(() => PdpJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => PdpJoinWhereUniqueInputSchema),
          z.lazy(() => PdpJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => PdpJoinWhereUniqueInputSchema),
          z.lazy(() => PdpJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => PdpJoinUpdateWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => PdpJoinUpdateWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => PdpJoinUpdateManyWithWhereWithoutProductInputSchema),
          z.lazy(() => PdpJoinUpdateManyWithWhereWithoutProductInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => PdpJoinScalarWhereInputSchema),
          z.lazy(() => PdpJoinScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default PdpJoinUpdateManyWithoutProductNestedInputSchema;
