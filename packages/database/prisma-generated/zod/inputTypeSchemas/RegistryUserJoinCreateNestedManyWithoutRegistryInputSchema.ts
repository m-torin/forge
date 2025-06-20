import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinCreateWithoutRegistryInputSchema } from './RegistryUserJoinCreateWithoutRegistryInputSchema';
import { RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema } from './RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema';
import { RegistryUserJoinCreateOrConnectWithoutRegistryInputSchema } from './RegistryUserJoinCreateOrConnectWithoutRegistryInputSchema';
import { RegistryUserJoinCreateManyRegistryInputEnvelopeSchema } from './RegistryUserJoinCreateManyRegistryInputEnvelopeSchema';
import { RegistryUserJoinWhereUniqueInputSchema } from './RegistryUserJoinWhereUniqueInputSchema';

export const RegistryUserJoinCreateNestedManyWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryUserJoinCreateNestedManyWithoutRegistryInput> = z.object({
  create: z.union([ z.lazy(() => RegistryUserJoinCreateWithoutRegistryInputSchema),z.lazy(() => RegistryUserJoinCreateWithoutRegistryInputSchema).array(),z.lazy(() => RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema),z.lazy(() => RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RegistryUserJoinCreateOrConnectWithoutRegistryInputSchema),z.lazy(() => RegistryUserJoinCreateOrConnectWithoutRegistryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RegistryUserJoinCreateManyRegistryInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),z.lazy(() => RegistryUserJoinWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default RegistryUserJoinCreateNestedManyWithoutRegistryInputSchema;
