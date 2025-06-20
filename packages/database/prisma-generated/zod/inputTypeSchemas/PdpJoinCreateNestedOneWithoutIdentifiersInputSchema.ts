import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutIdentifiersInputSchema } from './PdpJoinCreateWithoutIdentifiersInputSchema';
import { PdpJoinUncheckedCreateWithoutIdentifiersInputSchema } from './PdpJoinUncheckedCreateWithoutIdentifiersInputSchema';
import { PdpJoinCreateOrConnectWithoutIdentifiersInputSchema } from './PdpJoinCreateOrConnectWithoutIdentifiersInputSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';

export const PdpJoinCreateNestedOneWithoutIdentifiersInputSchema: z.ZodType<Prisma.PdpJoinCreateNestedOneWithoutIdentifiersInput> = z.object({
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutIdentifiersInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutIdentifiersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PdpJoinCreateOrConnectWithoutIdentifiersInputSchema).optional(),
  connect: z.lazy(() => PdpJoinWhereUniqueInputSchema).optional()
}).strict();

export default PdpJoinCreateNestedOneWithoutIdentifiersInputSchema;
