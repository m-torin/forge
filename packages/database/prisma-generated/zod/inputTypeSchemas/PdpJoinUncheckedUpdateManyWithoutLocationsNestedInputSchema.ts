import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutLocationsInputSchema } from './PdpJoinCreateWithoutLocationsInputSchema';
import { PdpJoinUncheckedCreateWithoutLocationsInputSchema } from './PdpJoinUncheckedCreateWithoutLocationsInputSchema';
import { PdpJoinCreateOrConnectWithoutLocationsInputSchema } from './PdpJoinCreateOrConnectWithoutLocationsInputSchema';
import { PdpJoinUpsertWithWhereUniqueWithoutLocationsInputSchema } from './PdpJoinUpsertWithWhereUniqueWithoutLocationsInputSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateWithWhereUniqueWithoutLocationsInputSchema } from './PdpJoinUpdateWithWhereUniqueWithoutLocationsInputSchema';
import { PdpJoinUpdateManyWithWhereWithoutLocationsInputSchema } from './PdpJoinUpdateManyWithWhereWithoutLocationsInputSchema';
import { PdpJoinScalarWhereInputSchema } from './PdpJoinScalarWhereInputSchema';

export const PdpJoinUncheckedUpdateManyWithoutLocationsNestedInputSchema: z.ZodType<Prisma.PdpJoinUncheckedUpdateManyWithoutLocationsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => PdpJoinCreateWithoutLocationsInputSchema),
          z.lazy(() => PdpJoinCreateWithoutLocationsInputSchema).array(),
          z.lazy(() => PdpJoinUncheckedCreateWithoutLocationsInputSchema),
          z.lazy(() => PdpJoinUncheckedCreateWithoutLocationsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => PdpJoinCreateOrConnectWithoutLocationsInputSchema),
          z.lazy(() => PdpJoinCreateOrConnectWithoutLocationsInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => PdpJoinUpsertWithWhereUniqueWithoutLocationsInputSchema),
          z.lazy(() => PdpJoinUpsertWithWhereUniqueWithoutLocationsInputSchema).array(),
        ])
        .optional(),
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
          z.lazy(() => PdpJoinUpdateWithWhereUniqueWithoutLocationsInputSchema),
          z.lazy(() => PdpJoinUpdateWithWhereUniqueWithoutLocationsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => PdpJoinUpdateManyWithWhereWithoutLocationsInputSchema),
          z.lazy(() => PdpJoinUpdateManyWithWhereWithoutLocationsInputSchema).array(),
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

export default PdpJoinUncheckedUpdateManyWithoutLocationsNestedInputSchema;
