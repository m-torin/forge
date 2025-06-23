import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutIdentifiersInputSchema } from './PdpJoinCreateWithoutIdentifiersInputSchema';
import { PdpJoinUncheckedCreateWithoutIdentifiersInputSchema } from './PdpJoinUncheckedCreateWithoutIdentifiersInputSchema';
import { PdpJoinCreateOrConnectWithoutIdentifiersInputSchema } from './PdpJoinCreateOrConnectWithoutIdentifiersInputSchema';
import { PdpJoinUpsertWithoutIdentifiersInputSchema } from './PdpJoinUpsertWithoutIdentifiersInputSchema';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';
import { PdpJoinUpdateToOneWithWhereWithoutIdentifiersInputSchema } from './PdpJoinUpdateToOneWithWhereWithoutIdentifiersInputSchema';
import { PdpJoinUpdateWithoutIdentifiersInputSchema } from './PdpJoinUpdateWithoutIdentifiersInputSchema';
import { PdpJoinUncheckedUpdateWithoutIdentifiersInputSchema } from './PdpJoinUncheckedUpdateWithoutIdentifiersInputSchema';

export const PdpJoinUpdateOneWithoutIdentifiersNestedInputSchema: z.ZodType<Prisma.PdpJoinUpdateOneWithoutIdentifiersNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => PdpJoinCreateWithoutIdentifiersInputSchema),
          z.lazy(() => PdpJoinUncheckedCreateWithoutIdentifiersInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => PdpJoinCreateOrConnectWithoutIdentifiersInputSchema).optional(),
      upsert: z.lazy(() => PdpJoinUpsertWithoutIdentifiersInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => PdpJoinWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => PdpJoinWhereInputSchema)]).optional(),
      connect: z.lazy(() => PdpJoinWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => PdpJoinUpdateToOneWithWhereWithoutIdentifiersInputSchema),
          z.lazy(() => PdpJoinUpdateWithoutIdentifiersInputSchema),
          z.lazy(() => PdpJoinUncheckedUpdateWithoutIdentifiersInputSchema),
        ])
        .optional(),
    })
    .strict();

export default PdpJoinUpdateOneWithoutIdentifiersNestedInputSchema;
