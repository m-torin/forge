import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpUrlCreateWithoutPdpJoinInputSchema } from './PdpUrlCreateWithoutPdpJoinInputSchema';
import { PdpUrlUncheckedCreateWithoutPdpJoinInputSchema } from './PdpUrlUncheckedCreateWithoutPdpJoinInputSchema';
import { PdpUrlCreateOrConnectWithoutPdpJoinInputSchema } from './PdpUrlCreateOrConnectWithoutPdpJoinInputSchema';
import { PdpUrlCreateManyPdpJoinInputEnvelopeSchema } from './PdpUrlCreateManyPdpJoinInputEnvelopeSchema';
import { PdpUrlWhereUniqueInputSchema } from './PdpUrlWhereUniqueInputSchema';

export const PdpUrlUncheckedCreateNestedManyWithoutPdpJoinInputSchema: z.ZodType<Prisma.PdpUrlUncheckedCreateNestedManyWithoutPdpJoinInput> =
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
      createMany: z.lazy(() => PdpUrlCreateManyPdpJoinInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => PdpUrlWhereUniqueInputSchema),
          z.lazy(() => PdpUrlWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default PdpUrlUncheckedCreateNestedManyWithoutPdpJoinInputSchema;
