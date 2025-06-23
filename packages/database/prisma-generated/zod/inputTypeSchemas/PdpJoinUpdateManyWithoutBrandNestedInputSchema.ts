import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutBrandInputSchema } from './PdpJoinCreateWithoutBrandInputSchema';
import { PdpJoinUncheckedCreateWithoutBrandInputSchema } from './PdpJoinUncheckedCreateWithoutBrandInputSchema';
import { PdpJoinCreateOrConnectWithoutBrandInputSchema } from './PdpJoinCreateOrConnectWithoutBrandInputSchema';
import { PdpJoinUpsertWithWhereUniqueWithoutBrandInputSchema } from './PdpJoinUpsertWithWhereUniqueWithoutBrandInputSchema';
import { PdpJoinCreateManyBrandInputEnvelopeSchema } from './PdpJoinCreateManyBrandInputEnvelopeSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithWhereUniqueWithoutBrandInputSchema } from './PdpJoinUpdateWithWhereUniqueWithoutBrandInputSchema';
import { PdpJoinUpdateManyWithWhereWithoutBrandInputSchema } from './PdpJoinUpdateManyWithWhereWithoutBrandInputSchema';
import { PdpJoinScalarWhereInputSchema } from './PdpJoinScalarWhereInputSchema';

export const PdpJoinUpdateManyWithoutBrandNestedInputSchema: z.ZodType<Prisma.PdpJoinUpdateManyWithoutBrandNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => PdpJoinCreateWithoutBrandInputSchema),
          z.lazy(() => PdpJoinCreateWithoutBrandInputSchema).array(),
          z.lazy(() => PdpJoinUncheckedCreateWithoutBrandInputSchema),
          z.lazy(() => PdpJoinUncheckedCreateWithoutBrandInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => PdpJoinCreateOrConnectWithoutBrandInputSchema),
          z.lazy(() => PdpJoinCreateOrConnectWithoutBrandInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => PdpJoinUpsertWithWhereUniqueWithoutBrandInputSchema),
          z.lazy(() => PdpJoinUpsertWithWhereUniqueWithoutBrandInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => PdpJoinCreateManyBrandInputEnvelopeSchema).optional(),
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
          z.lazy(() => PdpJoinUpdateWithWhereUniqueWithoutBrandInputSchema),
          z.lazy(() => PdpJoinUpdateWithWhereUniqueWithoutBrandInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => PdpJoinUpdateManyWithWhereWithoutBrandInputSchema),
          z.lazy(() => PdpJoinUpdateManyWithWhereWithoutBrandInputSchema).array(),
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

export default PdpJoinUpdateManyWithoutBrandNestedInputSchema;
