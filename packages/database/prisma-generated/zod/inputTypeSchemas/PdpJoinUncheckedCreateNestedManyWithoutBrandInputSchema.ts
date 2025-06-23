import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutBrandInputSchema } from './PdpJoinCreateWithoutBrandInputSchema';
import { PdpJoinUncheckedCreateWithoutBrandInputSchema } from './PdpJoinUncheckedCreateWithoutBrandInputSchema';
import { PdpJoinCreateOrConnectWithoutBrandInputSchema } from './PdpJoinCreateOrConnectWithoutBrandInputSchema';
import { PdpJoinCreateManyBrandInputEnvelopeSchema } from './PdpJoinCreateManyBrandInputEnvelopeSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';

export const PdpJoinUncheckedCreateNestedManyWithoutBrandInputSchema: z.ZodType<Prisma.PdpJoinUncheckedCreateNestedManyWithoutBrandInput> =
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
      createMany: z.lazy(() => PdpJoinCreateManyBrandInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => PdpJoinWhereUniqueInputSchema),
          z.lazy(() => PdpJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default PdpJoinUncheckedCreateNestedManyWithoutBrandInputSchema;
