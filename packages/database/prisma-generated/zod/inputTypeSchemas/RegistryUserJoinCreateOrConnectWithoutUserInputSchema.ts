import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinWhereUniqueInputSchema } from './RegistryUserJoinWhereUniqueInputSchema';
import { RegistryUserJoinCreateWithoutUserInputSchema } from './RegistryUserJoinCreateWithoutUserInputSchema';
import { RegistryUserJoinUncheckedCreateWithoutUserInputSchema } from './RegistryUserJoinUncheckedCreateWithoutUserInputSchema';

export const RegistryUserJoinCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.RegistryUserJoinCreateOrConnectWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => RegistryUserJoinCreateWithoutUserInputSchema),
        z.lazy(() => RegistryUserJoinUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default RegistryUserJoinCreateOrConnectWithoutUserInputSchema;
