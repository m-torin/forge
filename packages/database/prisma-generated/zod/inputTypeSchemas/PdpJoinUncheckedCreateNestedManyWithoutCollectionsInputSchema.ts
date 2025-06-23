import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutCollectionsInputSchema } from './PdpJoinCreateWithoutCollectionsInputSchema';
import { PdpJoinUncheckedCreateWithoutCollectionsInputSchema } from './PdpJoinUncheckedCreateWithoutCollectionsInputSchema';
import { PdpJoinCreateOrConnectWithoutCollectionsInputSchema } from './PdpJoinCreateOrConnectWithoutCollectionsInputSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';

export const PdpJoinUncheckedCreateNestedManyWithoutCollectionsInputSchema: z.ZodType<Prisma.PdpJoinUncheckedCreateNestedManyWithoutCollectionsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => PdpJoinCreateWithoutCollectionsInputSchema),
          z.lazy(() => PdpJoinCreateWithoutCollectionsInputSchema).array(),
          z.lazy(() => PdpJoinUncheckedCreateWithoutCollectionsInputSchema),
          z.lazy(() => PdpJoinUncheckedCreateWithoutCollectionsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => PdpJoinCreateOrConnectWithoutCollectionsInputSchema),
          z.lazy(() => PdpJoinCreateOrConnectWithoutCollectionsInputSchema).array(),
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

export default PdpJoinUncheckedCreateNestedManyWithoutCollectionsInputSchema;
