import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpUrlCreateWithoutPdpJoinInputSchema } from './PdpUrlCreateWithoutPdpJoinInputSchema';
import { PdpUrlUncheckedCreateWithoutPdpJoinInputSchema } from './PdpUrlUncheckedCreateWithoutPdpJoinInputSchema';
import { PdpUrlCreateOrConnectWithoutPdpJoinInputSchema } from './PdpUrlCreateOrConnectWithoutPdpJoinInputSchema';
import { PdpUrlUpsertWithWhereUniqueWithoutPdpJoinInputSchema } from './PdpUrlUpsertWithWhereUniqueWithoutPdpJoinInputSchema';
import { PdpUrlCreateManyPdpJoinInputEnvelopeSchema } from './PdpUrlCreateManyPdpJoinInputEnvelopeSchema';
import { PdpUrlWhereUniqueInputSchema } from './PdpUrlWhereUniqueInputSchema';
import { PdpUrlUpdateWithWhereUniqueWithoutPdpJoinInputSchema } from './PdpUrlUpdateWithWhereUniqueWithoutPdpJoinInputSchema';
import { PdpUrlUpdateManyWithWhereWithoutPdpJoinInputSchema } from './PdpUrlUpdateManyWithWhereWithoutPdpJoinInputSchema';
import { PdpUrlScalarWhereInputSchema } from './PdpUrlScalarWhereInputSchema';

export const PdpUrlUncheckedUpdateManyWithoutPdpJoinNestedInputSchema: z.ZodType<Prisma.PdpUrlUncheckedUpdateManyWithoutPdpJoinNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => PdpUrlCreateWithoutPdpJoinInputSchema),
          z.lazy(() => PdpUrlCreateWithoutPdpJoinInputSchema).array(),
          z.lazy(() => PdpUrlUncheckedCreateWithoutPdpJoinInputSchema),
          z.lazy(() => PdpUrlUncheckedCreateWithoutPdpJoinInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => PdpUrlCreateOrConnectWithoutPdpJoinInputSchema),
          z.lazy(() => PdpUrlCreateOrConnectWithoutPdpJoinInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => PdpUrlUpsertWithWhereUniqueWithoutPdpJoinInputSchema),
          z.lazy(() => PdpUrlUpsertWithWhereUniqueWithoutPdpJoinInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => PdpUrlCreateManyPdpJoinInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => PdpUrlWhereUniqueInputSchema),
          z.lazy(() => PdpUrlWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => PdpUrlWhereUniqueInputSchema),
          z.lazy(() => PdpUrlWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => PdpUrlWhereUniqueInputSchema),
          z.lazy(() => PdpUrlWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => PdpUrlWhereUniqueInputSchema),
          z.lazy(() => PdpUrlWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => PdpUrlUpdateWithWhereUniqueWithoutPdpJoinInputSchema),
          z.lazy(() => PdpUrlUpdateWithWhereUniqueWithoutPdpJoinInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => PdpUrlUpdateManyWithWhereWithoutPdpJoinInputSchema),
          z.lazy(() => PdpUrlUpdateManyWithWhereWithoutPdpJoinInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => PdpUrlScalarWhereInputSchema),
          z.lazy(() => PdpUrlScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default PdpUrlUncheckedUpdateManyWithoutPdpJoinNestedInputSchema;
