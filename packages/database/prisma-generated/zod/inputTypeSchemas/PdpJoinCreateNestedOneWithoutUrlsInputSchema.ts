import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinCreateWithoutUrlsInputSchema } from './PdpJoinCreateWithoutUrlsInputSchema';
import { PdpJoinUncheckedCreateWithoutUrlsInputSchema } from './PdpJoinUncheckedCreateWithoutUrlsInputSchema';
import { PdpJoinCreateOrConnectWithoutUrlsInputSchema } from './PdpJoinCreateOrConnectWithoutUrlsInputSchema';
import { PdpJoinWhereUniqueInputSchema } from './PdpJoinWhereUniqueInputSchema';

export const PdpJoinCreateNestedOneWithoutUrlsInputSchema: z.ZodType<Prisma.PdpJoinCreateNestedOneWithoutUrlsInput> = z.object({
  create: z.union([ z.lazy(() => PdpJoinCreateWithoutUrlsInputSchema),z.lazy(() => PdpJoinUncheckedCreateWithoutUrlsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PdpJoinCreateOrConnectWithoutUrlsInputSchema).optional(),
  connect: z.lazy(() => PdpJoinWhereUniqueInputSchema).optional()
}).strict();

export default PdpJoinCreateNestedOneWithoutUrlsInputSchema;
