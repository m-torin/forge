import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinCreateWithoutUserInputSchema } from './RegistryUserJoinCreateWithoutUserInputSchema';
import { RegistryUserJoinUncheckedCreateWithoutUserInputSchema } from './RegistryUserJoinUncheckedCreateWithoutUserInputSchema';
import { RegistryUserJoinCreateOrConnectWithoutUserInputSchema } from './RegistryUserJoinCreateOrConnectWithoutUserInputSchema';
import { RegistryUserJoinCreateManyUserInputEnvelopeSchema } from './RegistryUserJoinCreateManyUserInputEnvelopeSchema';
import { RegistryUserJoinWhereUniqueInputSchema } from './RegistryUserJoinWhereUniqueInputSchema';

export const RegistryUserJoinCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.RegistryUserJoinCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => RegistryUserJoinCreateWithoutUserInputSchema),z.lazy(() => RegistryUserJoinCreateWithoutUserInputSchema).array(),z.lazy(() => RegistryUserJoinUncheckedCreateWithoutUserInputSchema),z.lazy(() => RegistryUserJoinUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RegistryUserJoinCreateOrConnectWithoutUserInputSchema),z.lazy(() => RegistryUserJoinCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RegistryUserJoinCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),z.lazy(() => RegistryUserJoinWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default RegistryUserJoinCreateNestedManyWithoutUserInputSchema;
