import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinWhereUniqueInputSchema } from './RegistryUserJoinWhereUniqueInputSchema';
import { RegistryUserJoinUpdateWithoutUserInputSchema } from './RegistryUserJoinUpdateWithoutUserInputSchema';
import { RegistryUserJoinUncheckedUpdateWithoutUserInputSchema } from './RegistryUserJoinUncheckedUpdateWithoutUserInputSchema';
import { RegistryUserJoinCreateWithoutUserInputSchema } from './RegistryUserJoinCreateWithoutUserInputSchema';
import { RegistryUserJoinUncheckedCreateWithoutUserInputSchema } from './RegistryUserJoinUncheckedCreateWithoutUserInputSchema';

export const RegistryUserJoinUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.RegistryUserJoinUpsertWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => RegistryUserJoinUpdateWithoutUserInputSchema),
        z.lazy(() => RegistryUserJoinUncheckedUpdateWithoutUserInputSchema),
      ]),
      create: z.union([
        z.lazy(() => RegistryUserJoinCreateWithoutUserInputSchema),
        z.lazy(() => RegistryUserJoinUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default RegistryUserJoinUpsertWithWhereUniqueWithoutUserInputSchema;
