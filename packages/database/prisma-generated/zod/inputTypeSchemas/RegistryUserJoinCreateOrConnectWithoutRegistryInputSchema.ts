import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinWhereUniqueInputSchema } from './RegistryUserJoinWhereUniqueInputSchema';
import { RegistryUserJoinCreateWithoutRegistryInputSchema } from './RegistryUserJoinCreateWithoutRegistryInputSchema';
import { RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema } from './RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema';

export const RegistryUserJoinCreateOrConnectWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryUserJoinCreateOrConnectWithoutRegistryInput> = z.object({
  where: z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RegistryUserJoinCreateWithoutRegistryInputSchema),z.lazy(() => RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema) ]),
}).strict();

export default RegistryUserJoinCreateOrConnectWithoutRegistryInputSchema;
