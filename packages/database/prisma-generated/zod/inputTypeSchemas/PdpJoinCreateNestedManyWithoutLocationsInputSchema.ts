import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutLocationsInputSchema } from './PdpJoinCreateWithoutLocationsInputSchema';
import { PdpJoinUncheckedCreateWithoutLocationsInputSchema } from './PdpJoinUncheckedCreateWithoutLocationsInputSchema';
import { PdpJoinCreateOrConnectWithoutLocationsInputSchema } from './PdpJoinCreateOrConnectWithoutLocationsInputSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';

export const PdpJoinCreateNestedManyWithoutLocationsInputSchema: z.ZodType<Prisma.PdpJoinCreateNestedManyWithoutLocationsInput> =
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
      connect: z
        .union([
          z.lazy(() => PdpJoinWhereUniqueInputSchema),
          z.lazy(() => PdpJoinWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default PdpJoinCreateNestedManyWithoutLocationsInputSchema;
